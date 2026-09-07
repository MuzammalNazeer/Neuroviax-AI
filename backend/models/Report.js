const mongoose = require('mongoose');

// Section 10: Reports
// Saved and scheduled report definitions
const reportSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['sales_summary', 'inventory_valuation', 'cash_flow', 'expense_breakdown'],
      required: true,
      index: true,
    },
    dateRange: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    summaryData: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
