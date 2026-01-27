import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import { User, Asset, Balance } from '../models/index.mjs';

export const importExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const usersSheet = workbook.getWorksheet('users');
  const balancesSheet = workbook.getWorksheet('balances');
  const assetsSheet = workbook.getWorksheet('assets');

  if (!usersSheet || !balancesSheet || !assetsSheet) {
    throw new Error('Missing required sheets (users, balances, assets)');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userMap = new Map();

    // USERS
    usersSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const email = row.getCell(1).value;
      const role = row.getCell(2).value || 'USER';
      if (!email) throw new Error('User email missing');

      userMap.set(email, role);
    });

    const users = {};
    for (const [email, role] of userMap) {
      const user = await User.findOneAndUpdate(
        { email },
        { role },
        { upsert: true, new: true, session }
      );
      users[email] = user._id;
    }

    // BALANCES
    balancesSheet.eachRow(async (row, rowNumber) => {
      if (rowNumber === 1) return;
      const email = row.getCell(1).value;
      const currency = row.getCell(2).value;
      const amount = Number(row.getCell(3).value);

      if (!users[email]) throw new Error(`Balance user missing: ${email}`);

      await Balance.findOneAndUpdate(
        { userId: users[email], currency },
        { amount },
        { upsert: true, session }
      );
    });

    // ASSETS
    assetsSheet.eachRow(async (row, rowNumber) => {
      if (rowNumber === 1) return;
      const email = row.getCell(1).value;
      const assetType = row.getCell(2).value;
      const quantity = Number(row.getCell(3).value);

      if (!users[email]) throw new Error(`Asset user missing: ${email}`);

      await Asset.findOneAndUpdate(
        { userId: users[email], assetType },
        { quantity },
        { upsert: true, session }
      );
    });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
