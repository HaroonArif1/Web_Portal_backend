import sgMail from '@sendgrid/mail';


// sgMail.setDataResidency('eu');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (email, otp) => {
  try{
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'OTP Code',
      text: `Your login OTP is:  ${otp}`
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
