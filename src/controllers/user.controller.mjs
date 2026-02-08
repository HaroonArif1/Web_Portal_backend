import { Balance, Products } from '../models/index.mjs';

export const dashboard = async (req, res) => {
  const { account_id: AccountId } = req.user;

  const balances = await Balance.find({ AccountId, ProductId: {$in: [1, 35]} }).lean().exec();
  const bal = await balances.map(item => {
    if(item.ProductId === 35) return ({ ...item, Amount: item.Amount * 0.112})
      else return item;
  })
  const totalBalance = bal.reduce((acc, curr) => acc + +curr.Amount, 0) || 0;
  const productIds = bal.map(b => b.ProductId);
  
  // Fetch products related to the balances
  const products = await Products.find({ ProductId: { $in: productIds } }).lean().exec();
  return res.json({ message: "", payload: { totalBalance: totalBalance.toFixed(2), products } });
};
