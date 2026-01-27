import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/index.mjs';

export const verifyDotsSignature = (payload, signature) => {
  const computed = createHmac('sha256', env.DOTS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
};
