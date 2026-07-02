import { createHmac, timingSafeEqual } from 'node:crypto';

export function signPayload(payload: Buffer | string, secretKey: string) {
  return createHmac('sha256', secretKey).update(payload).digest('base64');
}

export function verifyPayloadSignature(payload: Buffer | string, signature: string, secretKey: string) {
  const expected = Buffer.from(signPayload(payload, secretKey));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}