import fs from 'fs';
import mongoose from 'mongoose';
import { parse } from 'fast-csv';
import User from '../models/User.mjs';
import Balance from '../models/Balance.mjs';
import Asset from '../models/Asset.mjs';
import { logger } from '../utils/logger.mjs';

const BATCH_SIZE = 2000;

export const importCsv = async (filePath) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let userBulk = [];
  let balanceBulk = [];
  let assetBulk = [];
  let processed = 0;

  const flushBatch = async () => {
    if (!userBulk.length) return;

    await User.bulkWrite(userBulk, { session });
    await Balance.bulkWrite(balanceBulk, { session });
    await Asset.bulkWrite(assetBulk, { session });

    userBulk = [];
    balanceBulk = [];
    assetBulk = [];
  };

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', reject)
        .on('data', async (row) => {
          processed++;

          const email = row.email?.toLowerCase();
          if (!email) throw new Error(`Missing email at row ${processed}`);

          /** USERS */
          userBulk.push({
            updateOne: {
              filter: { email },
              update: {
                $set: { role: row.role || 'USER' }
              },
              upsert: true
            }
          });

          /** BALANCES */
          balanceBulk.push({
            updateOne: {
              filter: { email, currency: 'USD' },
              update: {
                $set: { amount: Number(row.balance || 0) }
              },
              upsert: true
            }
          });

          /** ASSETS */
          assetBulk.push({
            updateOne: {
              filter: { email, assetType: row.assetType },
              update: {
                $set: { quantity: Number(row.quantity || 0) }
              },
              upsert: true
            }
          });

          if (userBulk.length >= BATCH_SIZE) {
            await flushBatch();
          }
        })
        .on('end', resolve);
    });

    // Flush remaining
    await flushBatch();

    await session.commitTransaction();
    logger.info(`CSV import successful. Records processed: ${processed}`);
  } catch (err) {
    await session.abortTransaction();
    logger.error('CSV import failed', { error: err.message });
    throw err;
  } finally {
    session.endSession();
    fs.unlinkSync(filePath);
  }
};
