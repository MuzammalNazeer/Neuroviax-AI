const mongoose = require('mongoose');

// Section 10 & Section 13: SubscriptionPlans
// Plan tiers, entitlements, billing — decoupled from core business logic
const subscriptionPlanSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ['starter', 'growth', 'professional', 'enterprise'],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    monthlyPricePKR: { type: Number, required: true },
    monthlyPriceUSD: { type: Number, required: true },
    entitlements: {
      maxUsers: { type: Number, default: 2 },
      maxBranches: { type: Number, default: 1 },
      maxProducts: { type: Number, default: 250 },
      maxOrdersPerMonth: { type: Number, default: 500 },
      aiRecommendationsEnabled: { type: Boolean, default: false },
      whatsappIntegrationEnabled: { type: Boolean, default: false },
      advancedForecastingEnabled: { type: Boolean, default: false },
      dedicatedSupport: { type: Boolean, default: false },
    },
    featuresList: [{ type: String }],
    badge: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
