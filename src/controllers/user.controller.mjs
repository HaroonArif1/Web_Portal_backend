import { Balance, TransferRequest } from '../models/index.mjs';

export const dashboard = async (req, res) => {
  const { account_id: AccountId, user_id } = req.user;

  const balances = await Balance.find({ AccountId, ProductId: {$in: [1, 35]} }).lean().exec();
  const bal = await balances.map(item => {
    if(item.ProductId === 35) return ({ ...item, Amount: item.Amount * 0.112})
      else return item;
  });
  const totalBalance = bal.reduce((acc, curr) => acc + +curr.Amount, 0) || 0;

  const list = await TransferRequest.find({ from: user_id, status: {$in: ['PENDING', 'APPROVED']} }).lean().exec();
  
  const amount = list.map(item => item.amount) || [];
  const transferedAmount = amount.reduce((acc, curr) => acc + +curr.amount, 0) || 0;
  
  return res.json({ message: "", payload: { totalBalance: (totalBalance - transferedAmount).toFixed(2), products: [] } });
};
