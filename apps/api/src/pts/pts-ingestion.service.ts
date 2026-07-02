import { Injectable } from '@nestjs/common';
import { buildConfirmationEnvelope, buildTagsInformationResponse, classifyPacket, extractPtsId, type JsonPtsEnvelope, type JsonPtsPacket, verifyPayloadSignature } from '@ez-monitor/pts-protocol';

type AcceptEnvelopeInput = { uri: string; envelope: JsonPtsEnvelope; headers: Record<string, string | string[] | undefined>; rawBody?: Buffer };

@Injectable()
export class PtsIngestionService {
  private readonly seenPacketKeys = new Set<string>();

  verifyBasicAuth(header: string | string[] | undefined, expectedUser: string, expectedPassword: string) {
    const value = Array.isArray(header) ? header[0] : header;
    if (!value?.startsWith('Basic ')) return false;
    const decoded = Buffer.from(value.slice('Basic '.length), 'base64').toString('utf8');
    return decoded === `${expectedUser}:${expectedPassword}`;
  }

  acceptEnvelope(input: AcceptEnvelopeInput): JsonPtsEnvelope {
    const ptsId = extractPtsId(input.envelope, input.headers);
    const signatureHeader = this.header(input.headers, 'x-data-signature');
    const secret = process.env.PTS_DEFAULT_SECRET_KEY;
    if (secret && signatureHeader && input.rawBody && !verifyPayloadSignature(input.rawBody, signatureHeader, secret)) {
      return { Protocol: 'jsonPTS', Packets: input.envelope.Packets.map((packet) => ({ Id: packet.Id, Type: packet.Type, Error: true, Code: 401, Message: 'EZ_MONITOR_INVALID_SIGNATURE' })) };
    }
    return { Protocol: 'jsonPTS', Packets: input.envelope.Packets.map((packet) => this.handlePacket(input.uri, ptsId, packet)) };
  }

  private handlePacket(uri: string, ptsId: string | undefined, packet: JsonPtsPacket): JsonPtsPacket {
    const kind = classifyPacket(packet);
    const dedupeKey = `${ptsId ?? 'unknown'}:${packet.Type}:${packet.Id}:${JSON.stringify(packet.Data ?? {})}`;
    const duplicate = this.seenPacketKeys.has(dedupeKey);
    this.seenPacketKeys.add(dedupeKey);
    console.info('[pts-ingestion]', { uri, ptsId, type: packet.Type, kind, duplicate });
    if (packet.Type === 'RequestTagsInformation') return buildTagsInformationResponse(packet, this.resolveTags(packet));
    return buildConfirmationEnvelope(packet).Packets[0];
  }

  private resolveTags(packet: JsonPtsPacket) {
    const data = packet.Data as Record<string, any> | undefined;
    const tags = Array.isArray(data?.Tags) ? data.Tags : [];
    return tags.map((item: Record<string, any>) => ({ Tag: String(item.Tag ?? ''), Valid: true, FuelGradeIds: typeof item.FuelGradeId === 'number' ? [item.FuelGradeId] : undefined, AccountType: 'Amount' as const, Balance: 1000, Price: typeof item.Price === 'number' ? item.Price : undefined, OwnerName: 'MVP Cardholder', CompanyName: 'EZ MONITOR Demo', VehicleNumber: 'AA0000AA', AdditionalInfo: 'MVP validation response' }));
  }

  private header(headers: Record<string, string | string[] | undefined>, name: string) {
    const found = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
    return Array.isArray(found) ? found[0] : found;
  }
}