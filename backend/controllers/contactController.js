const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const AuditLog = require('../models/AuditLog');

// Target admin recipient specified by user: nazirmuzammal28@gmail.com
const DEFAULT_ADMIN_EMAIL = 'nazirmuzammal28@gmail.com';

// @desc    Submit a contact / support inquiry and notify admin via email
// @route   POST /api/contact
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, category, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      message: 'Please provide all required fields: Name, Email, Subject, and Message.',
    });
  }

  const ticketId = `NVX-${Math.floor(100000 + Math.random() * 900000)}`;
  const submissionTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const adminRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL;

  // 1. Prepare Admin Email Notification HTML
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${name}, thank you for reaching out to Neuroviax AI regarding "${subject}".`)}`
    : null;

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; text-align: left; }
          .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; color: #d1fae5; font-size: 13px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
          .content { padding: 28px; }
          .section-title { font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .data-table td { padding: 10px 12px; border-bottom: 1px solid #1e293b; font-size: 14px; }
          .data-table td.label { color: #94a3b8; font-weight: 600; width: 35%; }
          .data-table td.val { color: #f8fafc; font-weight: 500; }
          .message-box { background: #1e293b; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 24px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .btn-group { display: flex; gap: 12px; margin-top: 20px; }
          .btn { display: inline-block; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; text-align: center; }
          .btn-primary { background: #10b981; color: #020617; }
          .btn-secondary { background: #334155; color: #ffffff; }
          .footer { padding: 16px 28px; background: #090d16; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">🔔 New Client Lead / Ticket</span>
            <h1>New Message from ${name}</h1>
            <p>Ticket ID: <strong>${ticketId}</strong> &bull; Received: ${submissionTime}</p>
          </div>
          <div class="content">
            <div class="section-title">Client & Inquiry Details</div>
            <table class="data-table">
              <tr>
                <td class="label">Client Name</td>
                <td class="val"><strong>${name}</strong></td>
              </tr>
              <tr>
                <td class="label">Work Email</td>
                <td class="val"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td class="label">Phone / WhatsApp</td>
                <td class="val">${phone || '<em>Not provided</em>'}</td>
              </tr>
              <tr>
                <td class="label">Department / Topic</td>
                <td class="val"><span style="background:#064e3b; color:#6ee7b7; padding:2px 8px; border-radius:4px; font-size:12px;">${category || 'General Support'}</span></td>
              </tr>
              <tr>
                <td class="label">Subject</td>
                <td class="val"><strong>${subject}</strong></td>
              </tr>
            </table>

            <div class="section-title">Detailed Client Message</div>
            <div class="message-box">${message}</div>

            <div style="margin-top: 24px;">
              <a href="mailto:${email}?subject=${encodeURIComponent(`Re: [Ticket ${ticketId}] ${subject}`)}" class="btn btn-primary" style="margin-right: 8px;">
                ✉️ Reply to ${name}
              </a>
              ${
                whatsappUrl
                  ? `<a href="${whatsappUrl}" class="btn btn-secondary" style="background:#22c55e; color:#020617; margin-right: 8px;">💬 Chat on WhatsApp</a>`
                  : ''
              }
              <a href="http://localhost:5175" class="btn btn-secondary">
                🛡️ Open Admin Cockpit
              </a>
            </div>
          </div>
          <div class="footer">
            Neuroviax AI Automated Customer Care Gateway &bull; Generated for Super Administrator (${adminRecipient})
          </div>
        </div>
      </body>
    </html>
  `;

  // 2. Dispatch Email Notification to Admin (nazirmuzammal28@gmail.com)
  try {
    await sendEmail({
      to: adminRecipient,
      subject: `🚨 [Neuroviax Lead] ${subject} — From ${name} (${category || 'Inquiry'})`,
      html: adminEmailHtml,
      replyTo: email,
    });
    console.log(`✅ [Contact] Admin notification successfully sent to ${adminRecipient} for ticket ${ticketId}`);
  } catch (emailErr) {
    console.error('⚠️ [Contact] Failed to send email to admin:', emailErr.message);
  }

  // 3. Dispatch Acknowledgment Email to Client
  try {
    const clientAckHtml = `
      <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; background: #090d16; color: #e2e8f0; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">Neuroviax AI Support Request Received</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to us. We have received your inquiry regarding <strong>"${subject}"</strong>.</p>
        <p>Your tracking reference number is: <strong style="color: #38bdf8;">${ticketId}</strong>.</p>
        <p>Our operations specialist is reviewing your message and will reply to your email (<strong>${email}</strong>) promptly.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">If your issue is urgent, you can also connect directly via our Official WhatsApp Support: <a href="https://wa.me/923264414694" style="color: #10b981;">+92 326 4414694</a>.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `Confirmation: We received your inquiry [Ticket ${ticketId}]`,
      html: clientAckHtml,
    });
  } catch (clientEmailErr) {
    // Non-fatal
  }

  // 4. Save to AuditLog for transparency in Super Admin Cockpit
  try {
    await AuditLog.create({
      action: 'CONTACT_TICKET_SUBMITTED',
      details: `Inquiry received from ${name} (${email}, Phone: ${phone || 'N/A'}) for ${category}: "${subject}". Admin notified at ${adminRecipient}.`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Web Client',
    });
  } catch (auditErr) {
    // Non-fatal
  }

  res.status(201).json({
    success: true,
    ticketId,
    message: `Thank you, ${name}! Your message has been sent to our team at ${adminRecipient}. Reference: ${ticketId}.`,
  });
});

module.exports = {
  submitContactForm,
};
