const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer.
 * Falls back to Ethereal test-account preview when SMTP env vars are not set.
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  let transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production / real SMTP
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Dev fallback — creates a temporary Ethereal test inbox.
    // Check console for preview URL after sending.
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
  }

  const from = process.env.EMAIL_FROM || '"Neuroviax AI" <no-reply@neuroviax.ai>';

  const info = await transporter.sendMail({ from, to, subject, html });

  // Log preview URL in dev so developer can view the email
  if (process.env.NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧  Email preview URL: ${previewUrl}`);
    }
  }

  return info;
};

module.exports = sendEmail;
