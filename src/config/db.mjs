import mongoose from 'mongoose';
import { env } from './env.mjs';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: 'customer_portal'
    });
    console.log('MongoDB connected');
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
