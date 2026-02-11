import express from 'express';
import { authenticate, validate } from '../middlewares/index.mjs';
import { createTransfer } from '../controllers/transfer.controller.mjs';
import { createTransferSchema } from '../validators/transfer.schema.mjs';

const router = express.Router();

router.post(
  '/request',
  authenticate,
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
