import type { JsonPtsEnvelope, JsonPtsPacket, PtsUploadType } from './types.js';

const uploadTypes = new Set<string>([
  'UploadPumpTransaction', 'UploadTankMeasurement', 'UploadInTankDelivery', 'UploadGpsRecord',
  'UploadAlertRecord', 'UploadPayment', 'UploadShift', 'UploadConfiguration', 'UploadStatus', 'RequestTagsInformation',
]);

export function isPtsUploadType(type: string): type is PtsUploadType {
  return uploadTypes.has(type);
}

export function classifyPacket(packet: JsonPtsPacket): 'upload' | 'card-request' | 'configuration' | 'control' | 'unknown' {
  if (packet.Type === 'RequestTagsInformation') return 'card-request';
  if (packet.Type.startsWith('Upload')) return 'upload';
  if (packet.Type.includes('Configuration') || packet.Type.startsWith('Get') || packet.Type.startsWith('Set')) return 'configuration';
  if (packet.Type.startsWith('Pump') || packet.Type.startsWith('PriceBoard') || packet.Type.startsWith('Reader')) return 'control';
  return 'unknown';
}

export function extractPtsId(envelope: Pick<JsonPtsEnvelope, 'PtsId'>, headers: Record<string, string | string[] | undefined>) {
  const fromHeader = Object.entries(headers).find(([key]) => key.toLowerCase() === 'x-pts-id')?.[1];
  const value = Array.isArray(fromHeader) ? fromHeader[0] : fromHeader;
  return envelope.PtsId ?? value;
}

export function assertJsonPtsEnvelope(value: unknown): asserts value is JsonPtsEnvelope {
  if (!value || typeof value !== 'object') throw new Error('jsonPTS envelope must be an object');
  const envelope = value as JsonPtsEnvelope;
  if (envelope.Protocol !== 'jsonPTS') throw new Error('Protocol must be jsonPTS');
  if (!Array.isArray(envelope.Packets)) throw new Error('Packets must be an array');
}