const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['branch', 'warehouse', 'both'], default: 'branch' },
    address: {
      line1: String,
      city: String,
      region: String,
      country: String,
      postalCode: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
