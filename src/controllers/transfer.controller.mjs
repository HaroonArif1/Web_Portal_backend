import { Balance, TransferRequest, User } from "../models/index.mjs";

export const createTransfer = async (req, res) => {
  const { email, amount } = req.body;
  
  const targetUser = await User.findOne({ email_address: email });
  if (!targetUser) {
    return res.status(404).json({ message: 'No user exists with such email' });
  }

  if(email === req.user.email_address)
    return res.status(403).json({ message: 'User can not transfer amount to himself.' });

  const existingTransfer = await TransferRequest.findOne({
    from: req.user.user_id,
    status: 'PENDING'
  }).lean().exec();

  if (existingTransfer?._id) {
    return res.status(400).json({ message: 'A pending transfer request already exists' });
  }

  const checkBalance = await Balance.find({
    AccountId: req.user.account_id,
    ProductId: {$in: [1, 35]}
  }).lean().exec();

  const bal = await checkBalance.map(item => {
    if(item.ProductId === 35) return ({ ...item, Amount: item.Amount * 0.112})
      else return item;
  });
  
  const balance = bal.reduce((acc, curr) => acc + +curr.Amount, 0) || 0;
  console.log({ result: Number(balance) < Number(amount), balance, float1: Number(balance), amount, float2: Number(amount)});
  
  if (Number(balance) < Number(amount)) {
    return res.status(400).json({ message: 'Insufficient Balance' });
  }

  targetUser.phone = req.body.phone;
  await targetUser.save();
  
  await TransferRequest.create({
    amount,
    from: req.user.user_id,
    to: targetUser.user_id,
    sourceUser: req.user._id,
    destinationUser: targetUser._id
  });

  return res.json({ message: 'Transfer request created', payload: {} });
};
