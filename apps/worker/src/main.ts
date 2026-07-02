import { classifyPacket, type JsonPtsPacket } from '@ez-monitor/pts-protocol';

export function normalizePacket(packet: JsonPtsPacket) {
  return { type: packet.Type, kind: classifyPacket(packet), normalizedAt: new Date().toISOString() };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('EZ MONITOR worker готовий: normalizers, alert rules, notifications.');
}