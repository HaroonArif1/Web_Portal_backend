import { verifyAccessToken } from '../utils/jwt.mjs';
import { RevokedToken } from '../models/index.mjs';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    const isRevoked = await RevokedToken.exists({ jti: payload.jti });
    if (isRevoked) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
