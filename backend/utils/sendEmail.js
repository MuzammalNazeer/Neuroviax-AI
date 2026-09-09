const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer.
 * Supports Gmail directly or any custom SMTP.
 * Falls back to Ethereal test-account preview when SMTP env vars are not set.
 *
 * @param {{ to: string, subject: string, html: string, replyTo?: string }} options
 */
const sendEmail = async ({ to, subject, html, replyTo }) => {
  let transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    if (process.env.EMAIL_SERVICE === 'gmail' || emailUser.includes('@gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    }
  } else {
    // Dev fallback — creates a temporary Ethereal test inbox.
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('[sendEmail] Ethereal fallback failed, using jsonTransport logger');
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  const from = process.env.EMAIL_FROM || (emailUser ? `"Neuroviax AI" <${emailUser}>` : '"Neuroviax AI" <no-reply@neuroviax.ai>');

  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧  Email preview URL: ${previewUrl}`);
    }
    console.log(`📨  Email sent successfully to: ${to} | Subject: "${subject}"`);
  }

  return info;
};

module.exports = sendEmail;
