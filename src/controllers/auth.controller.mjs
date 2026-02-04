import { User, RevokedToken } from '../models/index.mjs';
import { hashOTP } from '../utils/crypto.mjs';
import { signAccessToken } from '../utils/jwt.mjs';
import { generateOTP } from '../services/otp.service.mjs';
import { sendOTPEmail } from '../services/email.service.mjs';

export const requestOTP = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  const user = await User.findOne({ email_address: email, role: { $ne: 'ADMIN'} }).lean().exec();
  console.log({user});
  if(!user)
    return res.status(404).json({ message: 'User not exists with such email on marketplace' });

  let message = 'One time Password (OTP) sent at your email';
  if(user && !user.otpHash) {
    await User.findOneAndUpdate(
      { email_address: email },
      {
        otpHash: hashOTP(otp),
      },
      { upsert: true }
    );

    await sendOTPEmail(email, otp);
    return res.json({ message, payload: {} });
  }

  return res.json({ message: '', payload: {} });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email_address: email });

  if (!user)
    return res.status(404).json({ message: 'User not exists with such email on marketplace' });

  if (user.otpHash !== hashOTP(otp))
    return res.status(400).json({ message: 'Invalid OTP entered' });

  const data = user.toJSON();
  delete data.otpHash;

  // 🔐 Issue JWT
  const token = signAccessToken({
    _id: user._id,
    email: user.email_address,
    sub: user._id.toString(),
    user_id: user.user_id,
    account_id: user.account_id,
  });

  res.json({
    message: 'OTP verified successfully',
    payload: { token, user: data }
  });
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(' ')[1];

  const decoded = jwt.decode(token);
  if (!decoded?.jti || !decoded?.exp) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  await RevokedToken.create({
    jti: decoded.jti,
    expiresAt: new Date(decoded.exp * 1000)
  });

  return res.json({ message: 'Logged out successfully' });
};
