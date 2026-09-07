const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    direction: { type: String, enum: ['receivable', 'payable'], required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['cash', 'stripe', 'jazzcash', 'easypaisa', 'razorpay', 'bank_transfer'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    providerReference: String, // token/reference from payment gateway (never store raw card data - PCI scope reduction)
    accountIdentifier: String, // e.g. Phone number for JazzCash/Easypaisa, card last 4 for Stripe, IBAN for bank transfer
    accountTitle: String,
    verificationToken: String,
    isVerified: { type: Boolean, default: false },
    kycLevel: String,
    notes: String,
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
