import crypto from 'node:crypto';

export const hashOTP = otp =>
  crypto.createHash('sha256').update(otp).digest('hex');
