import fs from 'node:fs';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.mjs';
import { auditLog } from '../middlewares/index.mjs';
import { importExcel } from '../services/parse.service.mjs';
import { ensureDotsUser } from '../services/dotsUser.service.mjs';
import { User, Balance, TransferRequest } from '../models/index.mjs';
import { executeDotsTransfer } from '../services/dotsTransfer.service.mjs';

import { signAccessToken } from '../utils/jwt.mjs';
import { comparePassword } from '../utils/password.mjs';

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({
    email_address: email,
    role: 'ADMIN'
  }).select('+passwordHash').lean().exec();

  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await comparePassword(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signAccessToken({
    sub: admin._id.toString(),
    role: admin.role,
    email: admin.email_address
  });

  delete admin.passwordHash;

  return res.json({
    message : "",
    payload : { token, adminData: admin }
  });
};


/**
 * APPROVE TRANSFER
 */

export const approveTransfer = async (req, res) => {
  const { id } = req.params;

  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // const transfer = await TransferRequest.findById(id).session(session);
    const transfer = await TransferRequest.findById(id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    if (transfer.status !== 'PENDING') {
      return res.status(400).json({ message: `Your Transfer request already ${transfer.status}` });
    }

    // const sourceUser = await User.findById(transfer.from).session(session);
    const sourceUser = await User.findById(transfer.sourceUser);
    const user = await User.findById(transfer.destinationUser);
    // const user = await User.findById(transfer.to).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // ✅ Ensure user exists on Dots
    const destinationDotsUserId = await ensureDotsUser(user);

    // 🔒 Lock balance
    const balance = await Balance.find({
      AccountId: sourceUser.account_id,
    });
    // }).session(session);

    const totalBalance = balance.reduce((acc, curr) => acc + +curr.Amount, 0) || 0;

    if (!balance || totalBalance < transfer.amount) {
      throw new Error('Insufficient balance');
    }

    const idempotencyKey = `transfer-${transfer._id}`;

    // 💸 Execute transfer
    const dotsResponse = await executeDotsTransfer({
      Amount: transfer.amount,
      destinationUserId: destinationDotsUserId,
      idempotencyKey
    });

    console.log({dotsResponse});
    

    // Update DB
    sourceUser.totalBalance = totalBalance - transfer.amount;
    await sourceUser.save();
    // await sourceUser.save({ session });

    transfer.status = 'APPROVED';
    transfer.providerTransactionId = dotsResponse.id;
    // transfer.destinationDotsUserId = desstinationDotsUserId;
    transfer.approvedAt = new Date();

    await transfer.save();
    // await transfer.save({ session });

    // await session.commitTransaction();

    return res.json({
      message: 'Transfer approved and sent to Dots',
      payload: { dotsResponse, transfer }
    });
  } catch (err) {
    console.log({err});
    // await session.abortTransaction();
    logger.error('Approve transfer failed', { error: err.message });

    res.status(500).json({
      message: 'Transfer approval failed',
      error: err.message
    });
  } finally {
    // session.endSession();
  }
};


/**
 * REJECT TRANSFER
 */
export const rejectTransfer = async (req, res) => {
  try {
    const transfer = await TransferRequest.findById(req.params.id);
  
    if (!transfer || transfer.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid transfer request' });
    }
  
    transfer.status = 'REJECTED';
    transfer.approvedAt = new Date();
    await transfer.save();
  
    await auditLog('REJECT_TRANSFER', 'TransferRequest')(req, transfer._id);
  
    return res.json({ message: 'Transfer rejected' });
    
  } catch (error) {
    return res.status(500).json({ message: 'Error rejecting transfer', error: error.message });
  }
};

export const importExcelData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File required' });
    }

    await importExcel(req.file.path);

    await auditLog('IMPORT_EXCEL', 'SYSTEM')(req);

    fs.unlinkSync(req.file.path);

    res.json({ message: 'Excel data imported successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listPendingTransfers = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    email,
    assetType,
    from,
    to
  } = req.validated.query;

  const match = { status: 'PENDING' };

  if (assetType) match.assetType = assetType;
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  let userIds;
  if (email) {
    const users = await User.find({
      email: { $regex: email, $options: 'i' }
    }).select('_id');

    userIds = users.map(u => u._id);
    match.userId = { $in: userIds };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    TransferRequest.find(match)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    TransferRequest.countDocuments(match)
  ]);

  res.json({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    data
  });
};

export const listTransferRequests = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortOrder = 'desc',
    sortBy = 'createdAt',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const [list, total] = await Promise.all([
    TransferRequest.find()
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('sourceUser', 'email_address username user_id account_id')
      .populate('destinationUser', 'email_address username user_id account_id')
      .lean()
      .exec(),
    TransferRequest.countDocuments()
  ]);

  return res.json({
    message: "Transfers requests list fetched successfully",
    payload: {
      total,
      list,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
};