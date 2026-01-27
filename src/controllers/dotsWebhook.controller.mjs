import mongoose from 'mongoose';
import { Balance, TransferRequest } from '../models/index.mjs';
import { verifyDotsSignature } from '../utils/dotsWebhook.mjs';
import { logger } from '../utils/logger.mjs';

export const handleDotsWebhook = async (req, res) => {
  const signature = req.headers['x-dots-signature'];
  if (!signature) {
    return res.status(400).send('Missing signature');
  }

  const isValid = verifyDotsSignature(req.body, signature);
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());

  const { type, data } = event;

  // Only handle transfer events
  if (!type.startsWith('transfer.')) {
    return res.json({ received: true });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await TransferRequest.findOne({
      provider: 'DOTS',
      providerTransactionId: data.id
    }).session(session);

    if (!transfer) {
      throw new Error('Transfer not found');
    }

    // Idempotency: already finalized
    if (['COMPLETED', 'FAILED'].includes(transfer.status)) {
      await session.commitTransaction();
      return res.json({ received: true });
    }

    if (type === 'transfer.completed') {
      transfer.status = 'COMPLETED';
      transfer.completedAt = new Date();
    }

    if (type === 'transfer.failed') {
      transfer.status = 'FAILED';
      transfer.failureReason = data.failure_reason || 'UNKNOWN';

      // 💰 Refund balance
      const balance = await Balance.findOne({
        userId: transfer.userId,
        currency: transfer.currency
      }).session(session);

      balance.amount += transfer.amount;
      await balance.save({ session });
    }

    await transfer.save({ session });
    await session.commitTransaction();

    res.json({ received: true });
  } catch (err) {
    await session.abortTransaction();
    logger.error('Dots webhook failed', { error: err.message });
    res.status(500).send('Webhook error');
  } finally {
    session.endSession();
  }
};
