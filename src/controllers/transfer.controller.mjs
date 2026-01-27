import { Balance, TransferRequest, User } from "../models/index.mjs";

export const createTransfer = async (req, res) => {
  const { email, amount } = req.body;

  const checkBalance = await Balance.find({
    AccountId: req.user.account_id,
  }).lean().exec();

  const balance = checkBalance.reduce((acc, curr) => acc + +curr.Amount, 0) || 0;
  
  if (balance < amount) {
    return res.status(400).json({ message: 'Insufficient Balance' });
  }
  
  const existingTransfer = await TransferRequest.findOne({
    from: req.user.user_id,
    status: 'PENDING'
  }).lean().exec();

  if (existingTransfer?._id) {
    return res.status(400).json({ message: 'A pending transfer request already exists' });
  }
  
  const targetUser = await User.findOne({ email_address: email });
  if (!targetUser) {
    return res.status(404).json({ message: 'No user exists with such email' });
  }

  targetUser.phone = req.body.phone;
  await targetUser.save();
  
  await TransferRequest.create({
    from: req.user.user_id,
    to: targetUser.user_id,
    amount,
    sourceUser: req.user._id,
    destinationUser: targetUser._id
  });

  return res.json({ message: 'Transfer request created', payload: {} });
};
