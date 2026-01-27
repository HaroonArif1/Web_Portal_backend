import rateLimit from 'express-rate-limit';

/**
 * OTP abuse protection
 * 5 OTP requests per email/IP per 15 minutes
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many OTP requests. Please try again later.'
  }
});

/**
 * Transfer request throttling
 * 10 transfers per user per hour
 */
export const transferRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Transfer rate limit exceeded.'
  }
});
