const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: String,
    email: String,
    // used by procurement supplier-comparison logic (FR-06)
    reliabilityScore: { type: Number, min: 0, max: 100, default: 70 },
    leadTimeDays: { type: Number, default: 7 },
    priceHistory: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        price: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
