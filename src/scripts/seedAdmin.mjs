import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { User } from '../models/index.mjs';
import { env } from '../config/index.mjs';
import { hashPassword } from '../utils/password.mjs';

const seedAdmin = async () => {
  await mongoose.connect(env.MONGO_URI);

  const existing = await User.findOne({
    email_address: env.ADMIN_EMAIL
  });
  
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  
  await User.create({
    email_address: env.ADMIN_EMAIL,
    passwordHash,
    role: 'ADMIN',
    user_id: crypto.randomUUID(),
    account_id: crypto.randomUUID(),
    username: 'Admin'
  });

  console.log('Admin user created');
  process.exit(0);
};

seedAdmin();
