const mongoose = require('mongoose');

// Section 6.6 & Section 10: Expenses / Payments
// Categorized business expenses reconciled against Orders and Cash-Flow
const expenseSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['rent', 'utilities', 'salaries', 'inventory_shipping', 'marketing', 'maintenance', 'software', 'tax', 'other'],
      default: 'other',
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['paid', 'pending', 'scheduled'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'stripe', 'other'],
      default: 'cash',
    },
    notes: { type: String, default: '' },
    // Optional reconciliation link to an order (e.g. shipping or supplier fee)
    reconciledOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
