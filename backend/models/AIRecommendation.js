const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    assistant: {
      type: String,
      enum: ['procurement', 'inventory', 'sales', 'marketing', 'customer_support', 'finance'],
      required: true,
    },
    // Section 7.2 risk-tiered autonomy model
    riskTier: { type: String, enum: ['low', 'medium', 'high'], required: true },
    action: { type: String, required: true }, // e.g. "reorder_suggestion"
    payload: { type: mongoose.Schema.Types.Mixed, default: {} }, // structured action payload
    rationale: { type: String, required: true }, // explainability (Section 7.3)
    confidenceScore: { type: Number, min: 0, max: 1, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'edited', 'rejected', 'auto_executed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    relatedSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
