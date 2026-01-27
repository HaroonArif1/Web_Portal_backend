import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.mjs';

export const signAccessToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID()
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
