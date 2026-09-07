const mongoose = require('mongoose');

// Section 10 & Section 8: Integrations
// Third-party connection configuration and credentials metadata
const integrationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    provider: {
      type: String,
      enum: ['whatsapp', 'stripe', 'jazzcash', 'easypaisa', 'razorpay'],
      required: true,
      index: true,
    },
    isEnabled: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'pending_verification', 'error'],
      default: 'disconnected',
    },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    config: {
      // Credentials metadata (masked in responses for security, Section 12.1)
      apiKeyMasked: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      phoneId: { type: String, default: '' },
      merchantId: { type: String, default: '' },
      lastSyncedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Integration', integrationSchema);
