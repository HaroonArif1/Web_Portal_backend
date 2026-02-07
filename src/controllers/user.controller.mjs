import { Balance, Products } from '../models/index.mjs';

export const dashboard = async (req, res) => {
  const { account_id: AccountId } = req.user;

  const balances = await Balance.find({ AccountId, ProductId: 1 }).lean().exec();
  const totalBalance = balances.reduce((acc, curr) => acc + +curr.Amount, 0) || 0;
  
  const productIds = balances.map(b => b.ProductId);
  
  // Fetch products related to the balances
  const products = await Products.find({ ProductId: { $in: productIds } }).lean().exec();
  return res.json({ message: "", payload: { totalBalance, products } });
};
