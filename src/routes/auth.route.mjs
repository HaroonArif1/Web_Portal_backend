import express from 'express';
import { validate, authenticate } from '../middlewares/index.mjs';
import { logout, requestOTP, verifyOTP } from '../controllers/auth.controller.mjs';
import { requestOtpSchema, verifyOtpSchema } from '../validators/auth.schema.mjs';

const router = express.Router();

router.post(
  '/request-otp',
  // otpRateLimiter,
  validate(requestOtpSchema),
  requestOTP
);

router.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  verifyOTP
);

router.post('/logout', authenticate, logout);

export default router;

/**
 * @swagger
 * /auth/request-otp:
 *   post:
 *     summary: Request login OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Auth]
 */

