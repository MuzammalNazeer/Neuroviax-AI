const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer.
 * Primary: Authenticated Gmail SMTP (port 587 TLS with App Password)
 * This delivers reliably to any inbox including Yopmail and Gmail.
 *
 * @param {{ to: string, subject: string, html: string, text?: string, replyTo?: string }} options
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const emailUser = process.env.EMAIL_USER || 'ef91646@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'hukkfxseuezwnmyk';
  const from = process.env.EMAIL_FROM || `"Neuroviax AI" <${emailUser}>`;

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  // 1. Primary: Use verified Gmail SMTP (port 587 TLS) - tested & working with 250 OK
  const gmailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ [sendEmail] Delivered successfully to: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.warn(`⚠️ [sendEmail] Gmail SMTP attempt failed for ${to}: ${err.message}`);

    // Fallback: If Yopmail and direct delivery requested
    const isYopmail = to && to.toLowerCase().includes('yopmail');
    if (isYopmail) {
      try {
        const yopTransporter = nodemailer.createTransport({
          host: 'smtp.yopmail.com',
          port: 25,
          secure: false,
          tls: { rejectUnauthorized: false }
        });
        const yopInfo = await yopTransporter.sendMail(mailOptions);
        console.log(`✅ [sendEmail] Direct Yopmail delivery to: ${to}`);
        return yopInfo;
      } catch (yopErr) {
        console.warn(`⚠️ [sendEmail] Direct Yopmail fallback failed: ${yopErr.message}`);
      }
    }

    // Dev JSON fallback
    const fallbackTransport = nodemailer.createTransport({ jsonTransport: true });
    const fallbackInfo = await fallbackTransport.sendMail(mailOptions);
    return fallbackInfo;
  }
};

module.exports = sendEmail;
