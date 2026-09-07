const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: {
      type: String,
      enum: ['retail', 'distribution', 'manufacturing', 'other'],
      default: 'retail',
    },
    taxRegime: {
      country: { type: String, default: 'PK' },
      taxId: String,
      taxRate: { type: Number, default: 0 }, // percent, jurisdiction-correct calc placeholder
    },
    currency: { type: String, default: 'PKR' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionPlan: {
      type: String,
      enum: ['starter', 'growth', 'professional', 'enterprise'],
      default: 'starter',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);
