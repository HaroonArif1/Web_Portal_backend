import sgMail from '@sendgrid/mail';
import { env } from './env.mjs';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendMail = async ({ to, subject, text, html }) => {
  return sgMail.send({
    to,
    from: env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html
  });
};
