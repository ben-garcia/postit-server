import nodemailer from 'nodemailer';

/**
 * Configures the nodemailer transporter.
 *
 * When in development it uses ethereal test account
 */
export const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: process.env.TRANSPORT_HOST || 'smtp.ethereal.email',
    port: process.env.TRANSPORT_PORT || 587,
    secure: Number(process.env.TRANSPORT_PORT) === 465,
    auth: {
      user: process.env.TRANSPORT_USER || testAccount.user,
      pass: process.env.TRANSPORT_PASS || testAccount.pass,
    },
  });

  return transporter;
};
