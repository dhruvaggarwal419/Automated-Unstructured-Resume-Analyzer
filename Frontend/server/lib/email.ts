import nodemailer from 'nodemailer';

interface VerificationEmailPayload {
  to: string;
  name: string;
  token: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('Missing SMTP configuration');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

export const sendVerificationEmail = async ({ to, name, token }: VerificationEmailPayload) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`;

  if (!from) {
    throw new Error('Missing SMTP_FROM');
  }

  const transporter = getTransporter();

  const subject = 'Verify your Resume World account';
  const text = `Hi ${name},\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nIf you did not create an account, you can ignore this email.\n`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2 style="margin: 0 0 12px;">Verify your email</h2>
      <p style="margin: 0 0 16px;">Hi ${name},</p>
      <p style="margin: 0 0 16px;">Please verify your email address by clicking the button below.</p>
      <p style="margin: 0 0 24px;">
        <a href="${verifyUrl}" style="background: #1f3a2f; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
      </p>
      <p style="margin: 0 0 12px;">If the button does not work, copy and paste this link:</p>
      <p style="margin: 0 0 24px; color: #1f3a2f;">${verifyUrl}</p>
      <p style="margin: 0; color: #666;">If you did not create an account, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};
