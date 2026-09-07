const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { PLANS } = require('../config/stripe');

/**
 * Check if a user has an active, valid subscription
 */
const hasActiveSubscription = async (userId) => {
  if (!userId) return false;
  const user = await User.findById(userId);
  if (!user) return false;

  // If user is on FREE plan, they have basic tier access
  if (user.currentPlan === 'FREE') {
    return true;
  }

  // Check Subscription document
  const sub = await Subscription.findOne({ userId, status: { $in: ['active', 'trialing'] } });
  if (sub) {
    // Also check period end if present
    if (sub.currentPeriodEnd && new Date() > new Date(sub.currentPeriodEnd)) {
      return false;
    }
    return true;
  }

  // Fallback check on user fields
  if (user.subscriptionStatus === 'active') {
    if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
      return false;
    }
    return true;
  }

  return false;
};

/**
 * Check if user has at least the specified plan tier (hierarchy: PRO > BASIC > FREE)
 */
const hasPlan = async (userId, requiredPlan) => {
  if (!userId) return false;
  const user = await User.findById(userId);
  if (!user) return false;

  const planRank = { FREE: 0, BASIC: 1, PRO: 2 };
  const reqRank = planRank[(requiredPlan || 'FREE').toUpperCase()] || 0;
  const userRank = planRank[(user.currentPlan || 'FREE').toUpperCase()] || 0;

  // Active status check if requiredPlan > FREE
  if (reqRank > 0) {
    const isActive = await hasActiveSubscription(userId);
    if (!isActive) return false;
  }

  return userRank >= reqRank;
};

/**
 * Check if user can access a specific feature entitlement
 */
const canAccessFeature = async (userId, featureName) => {
  if (!userId) return false;
  const user = await User.findById(userId);
  if (!user) return false;

  const planKey = (user.currentPlan || 'FREE').toUpperCase();
  const planConfig = PLANS[planKey] || PLANS.FREE;

  if (!planConfig.entitlements) return false;

  // If feature is granted in this tier, verify active subscription if tier is paid
  const granted = Boolean(planConfig.entitlements[featureName]);
  if (!granted) return false;

  if (planKey !== 'FREE') {
    return await hasActiveSubscription(userId);
  }

  return true;
};

/**
 * Middleware: Enforces that the authenticated user has at least a specific subscription plan
 * or feature entitlement.
 * Usage:
 *   router.get('/premium-action', protect, requireSubscription('BASIC'))
 *   router.get('/ai-contract-review', protect, requireSubscription('contractReview', 'feature'))
 */
const requireSubscription = (requirement = 'BASIC', type = 'plan') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      let allowed = false;
      if (type === 'feature') {
        allowed = await canAccessFeature(req.user._id, requirement);
      } else {
        allowed = await hasPlan(req.user._id, requirement);
      }

      if (!allowed) {
        return res.status(403).json({
          code: 'SUBSCRIPTION_REQUIRED',
          message: `This feature requires a ${requirement} subscription. Please upgrade your plan to gain access.`,
          required: requirement,
          currentPlan: req.user.currentPlan || 'FREE',
          upgradeUrl: '/subscription/plans',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  requireSubscription,
  hasActiveSubscription,
  hasPlan,
  canAccessFeature,
};
