import { hashOTP } from '../utils/crypto.mjs';

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const verifyOTP = (otp, hash) =>
  hashOTP(otp) === hash;
