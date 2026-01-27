import express from 'express';
import { createTransfer } from '../controllers/transfer.controller.mjs';
import { createTransferSchema } from '../validators/transfer.schema.mjs';
import { authenticate, validate, transferRateLimiter } from '../middlewares/index.mjs';

const router = express.Router();

router.post(
  '/request',
  authenticate,
  // transferRateLimiter,
  validate(createTransferSchema),
  createTransfer
);

export default router;


/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Auth]
 */
