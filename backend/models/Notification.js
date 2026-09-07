const mongoose = require('mongoose');

// Section 10 & Section 11 (FR-07): Notifications
// Channel-aware (app/WhatsApp/email) with delivery status tracking
const notificationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'payment', 'stock_alert', 'ai_recommendation', 'system'],
      default: 'system',
      index: true,
    },
    channel: {
      type: String,
      enum: ['in_app', 'whatsapp', 'email'],
      default: 'in_app',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'delivered', 'pending', 'failed'],
      default: 'unread',
      index: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
