import type { JsonPtsEnvelope, JsonPtsPacket, TagInformation } from './types.js';

export function buildConfirmationEnvelope(packet: Pick<JsonPtsPacket, 'Id' | 'Type'>): JsonPtsEnvelope {
  return { Protocol: 'jsonPTS', Packets: [{ Id: packet.Id, Type: packet.Type, Message: 'OK' }] };
}

export function buildErrorEnvelope(packet: Pick<JsonPtsPacket, 'Id' | 'Type'>, code: number, message: string): JsonPtsEnvelope {
  return { Protocol: 'jsonPTS', Packets: [{ Id: packet.Id, Type: packet.Type, Error: true, Code: code, Message: message }] };
}

export function buildTagsInformationResponse(packet: Pick<JsonPtsPacket, 'Id'>, tags: TagInformation[]): JsonPtsPacket {
  return { Id: packet.Id, Message: 'OK', Type: 'TagsInformation', Data: { Tags: tags } };
}