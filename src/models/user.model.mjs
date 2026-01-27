import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  username: { 
    type: String, 
    required: true 
  },
  email_address: { 
    type: String, 
    required: true,
    unique: true 
  },
  account_id: {
    type: String,
    required: true
  },
  // role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  otpHash: String,
  dotsUserId: {
    type: String,
    index: true
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
    index: true
  },
  phone: {
    type: String,
    default: ""
  },
  totalBalance: {
    type: Number,
    default: 0
  },
  passwordHash: {
    type: String,
    select: false // VERY IMPORTANT
  },
}, { timestamps: true });

export default model('User', userSchema);
