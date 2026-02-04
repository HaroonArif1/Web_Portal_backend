import sgMail from '@sendgrid/mail';
import { env } from '../config/env.mjs';

// sgMail.setDataResidency('eu');
sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendOTPEmail = async (email, otp) => {
  console.log({from: env.SENDGRID_FROM_EMAIL});
  
  try{
    await sgMail.send({
      to: email,
      from: env.SENDGRID_FROM_EMAIL,
      subject: 'OTP Code',
      text: `Your login OTP is:  ${otp}`
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
