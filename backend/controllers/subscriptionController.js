const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { stripe, PLANS, getPriceId, getPublicPlans } = require('../config/stripe');

/**
 * @desc Get all public subscription plans
 * @route GET /api/subscriptions/plans
 * @access Public
 */
const getPlans = asyncHandler(async (req, res) => {
  const plans = getPublicPlans();
  res.json({
    success: true,
    plans,
  });
});

/**
 * @desc Create a Stripe Checkout Session for recurring subscriptions
 * @route POST /api/subscriptions/checkout
 * @access Protected
 */
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { plan, billingInterval = 'monthly' } = req.body;

  if (!plan) {
    return res.status(400).json({ message: 'Plan identifier is required' });
  }

  const normalizedPlan = plan.toUpperCase();
  const normalizedInterval = billingInterval.toLowerCase();

  if (!['BASIC', 'PRO'].includes(normalizedPlan)) {
    return res.status(400).json({ message: 'Only BASIC and PRO tiers require checkout. FREE tier is default.' });
  }

  if (!['monthly', 'yearly'].includes(normalizedInterval)) {
    return res.status(400).json({ message: 'Billing interval must be monthly or yearly' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user already has an active subscription to this tier
  if (user.currentPlan === normalizedPlan && user.subscriptionStatus === 'active') {
    return res.status(400).json({
      message: `You are already subscribed to the ${normalizedPlan} plan.`,
    });
  }

  // Ensure user has a Stripe Customer ID
  let stripeCustomerId = user.stripeCustomerId;
  const isPlaceholderKey =
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY.includes('placeholder');

  if (!stripeCustomerId && !isPlaceholderKey) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    } catch (err) {
      console.error(`[Stripe Error] Failed to create customer: ${err.message}`);
    }
  }

  // Resolve Price ID
  const priceId = getPriceId(normalizedPlan, normalizedInterval);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // If using placeholder/demo keys, generate demo checkout session for local development
  if (isPlaceholderKey || priceId.includes('placeholder')) {
    console.log('[Stripe Dev Mode] Generating demo checkout session for testing...');
    return res.json({
      success: true,
      url: `${clientUrl}/subscription/success?demo=true&plan=${normalizedPlan}&interval=${normalizedInterval}`,
      sessionId: `demo_session_${Date.now()}`,
      mode: 'mock_demo',
    });
  }

  try {
    const sessionConfig = {
      customer: stripeCustomerId || undefined,
      customer_email: !stripeCustomerId ? user.email : undefined,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/subscription/cancel`,
      metadata: {
        userId: user._id.toString(),
        plan: normalizedPlan,
        billingInterval: normalizedInterval,
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan: normalizedPlan,
          billingInterval: normalizedInterval,
        },
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (stripeErr) {
    console.error(`[Stripe Checkout Error]: ${stripeErr.message}`);
    // Graceful development fallback
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        url: `${clientUrl}/subscription/success?demo=true&plan=${normalizedPlan}&interval=${normalizedInterval}`,
        sessionId: `demo_fallback_${Date.now()}`,
        notice: 'Live Stripe call failed with test key. Redirecting in demo simulation mode.',
      });
    }
    return res.status(500).json({
      message: `Failed to initialize Stripe checkout: ${stripeErr.message}`,
    });
  }
});

/**
 * @desc Get current user's subscription details and status
 * @route GET /api/subscriptions/me
 * @access Protected
 */
const getMySubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Find latest active or pending subscription record
  let sub = null;
  if (user.subscriptionId) {
    sub = await Subscription.findById(user.subscriptionId);
  }
  if (!sub) {
    sub = await Subscription.findOne({ userId: user._id }).sort({ createdAt: -1 });
  }

  const currentPlan = user.currentPlan || (sub ? sub.plan : 'FREE');
  const status = sub?.status || user.subscriptionStatus || 'active';
  const billingInterval = sub?.billingInterval || 'monthly';
  const currentPeriodEnd = sub?.currentPeriodEnd || user.subscriptionEndDate;
  const cancelAtPeriodEnd = sub?.cancelAtPeriodEnd || false;
  const nextBillingDate = cancelAtPeriodEnd ? null : currentPeriodEnd;

  const planDetails = PLANS[currentPlan] || PLANS.FREE;

  res.json({
    success: true,
    subscription: {
      currentPlan,
      status,
      billingInterval,
      currentPeriodStart: sub?.currentPeriodStart || null,
      currentPeriodEnd,
      nextBillingDate,
      cancelAtPeriodEnd,
      stripeCustomerId: user.stripeCustomerId || null,
      stripeSubscriptionId: sub?.stripeSubscriptionId || null,
      planDetails,
    },
  });
});

/**
 * @desc Cancel recurring subscription at period end
 * @route POST /api/subscriptions/cancel
 * @access Protected
 */
const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.currentPlan === 'FREE') {
    return res.status(400).json({ message: 'You are currently on the Free plan. No active subscription to cancel.' });
  }

  let sub = await Subscription.findOne({ userId: user._id, status: 'active' });
  if (!sub && user.subscriptionId) {
    sub = await Subscription.findById(user.subscriptionId);
  }

  const isPlaceholderKey =
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY.includes('placeholder');

  // If connected to Stripe and subscription ID exists
  if (sub && sub.stripeSubscriptionId && !isPlaceholderKey) {
    try {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      console.warn(`[Stripe Cancel Error]: ${err.message}`);
    }
  }

  // Update MongoDB state
  if (sub) {
    sub.cancelAtPeriodEnd = true;
    await sub.save();
  } else {
    // If no subscription record, create one to track cancellation state
    sub = await Subscription.create({
      userId: user._id,
      stripeCustomerId: user.stripeCustomerId || 'cust_manual',
      plan: user.currentPlan,
      status: 'active',
      cancelAtPeriodEnd: true,
      currentPeriodEnd: user.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    user.subscriptionId = sub._id;
    await user.save();
  }

  res.json({
    success: true,
    message: 'Your subscription will remain active until the end of the current billing period.',
    cancelAtPeriodEnd: true,
    currentPeriodEnd: sub.currentPeriodEnd,
    status: 'active',
  });
});

/**
 * @desc Reactivate subscription scheduled for cancellation at period end
 * @route POST /api/subscriptions/reactivate
 * @access Protected
 */
const reactivateSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  let sub = await Subscription.findOne({ userId: user._id });
  if (!sub || !sub.cancelAtPeriodEnd) {
    return res.status(400).json({ message: 'No scheduled cancellation found to reactivate.' });
  }

  const isPlaceholderKey =
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY.includes('placeholder');

  if (sub.stripeSubscriptionId && !isPlaceholderKey) {
    try {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (err) {
      console.warn(`[Stripe Reactivate Error]: ${err.message}`);
    }
  }

  sub.cancelAtPeriodEnd = false;
  await sub.save();

  res.json({
    success: true,
    message: 'Subscription successfully reactivated! Auto-renewal is resumed.',
    cancelAtPeriodEnd: false,
    status: sub.status,
  });
});

/**
 * @desc Create Stripe Customer Portal session
 * @route POST /api/subscriptions/portal
 * @access Protected
 */
const createPortalSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const isPlaceholderKey =
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY.includes('placeholder');

  if (!user.stripeCustomerId || isPlaceholderKey) {
    // In dev mode or if user has no Stripe ID yet, redirect to management page with notice
    return res.json({
      success: true,
      url: `${clientUrl}/subscription/management?notice=portal_demo`,
      isDemo: true,
    });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${clientUrl}/subscription/management`,
    });

    res.json({
      success: true,
      url: portalSession.url,
    });
  } catch (err) {
    console.error(`[Stripe Portal Error]: ${err.message}`);
    return res.status(500).json({
      message: `Failed to launch Customer Portal: ${err.message}`,
      fallbackUrl: `${clientUrl}/subscription/management`,
    });
  }
});

/**
 * @desc Admin Subscription Analytics Dashboard
 * @route GET /api/subscriptions/admin/analytics
 * @access Protected (Admin/Owner)
 */
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    freeUsersCount,
    basicUsersCount,
    proUsersCount,
    activeSubsCount,
    canceledSubsCount,
    pastDueSubsCount,
    yearlySubsCount,
    allSubs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ currentPlan: 'FREE' }),
    User.countDocuments({ currentPlan: 'BASIC' }),
    User.countDocuments({ currentPlan: 'PRO' }),
    Subscription.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ $or: [{ status: 'canceled' }, { cancelAtPeriodEnd: true }] }),
    Subscription.countDocuments({ status: 'past_due' }),
    Subscription.countDocuments({ billingInterval: 'yearly', status: 'active' }),
    Subscription.find({ status: 'active' }),
  ]);

  // Compute MRR
  let mrr = 0;
  // Calculate from active user subscriptions
  mrr += (basicUsersCount || 0) * PLANS.BASIC.monthlyPrice;
  mrr += (proUsersCount || 0) * PLANS.PRO.monthlyPrice;

  // If subscriptions exist with explicit intervals, adjust
  if (allSubs && allSubs.length > 0) {
    let computedMrr = 0;
    allSubs.forEach((s) => {
      const planConfig = PLANS[s.plan] || PLANS.FREE;
      if (s.billingInterval === 'yearly') {
        computedMrr += Math.round(planConfig.yearlyPrice / 12);
      } else {
        computedMrr += planConfig.monthlyPrice;
      }
    });
    if (computedMrr > 0) mrr = computedMrr;
  }

  const totalSubscribers = (basicUsersCount || 0) + (proUsersCount || 0);

  res.json({
    success: true,
    analytics: {
      totalSubscribers,
      activeSubscriptions: activeSubsCount || totalSubscribers,
      canceledSubscriptions: canceledSubsCount,
      failedPayments: pastDueSubsCount,
      monthlyRecurringRevenue: mrr,
      yearlySubscriptions: yearlySubsCount,
      usersByPlan: {
        FREE: freeUsersCount || 0,
        BASIC: basicUsersCount || 0,
        PRO: proUsersCount || 0,
      },
      totalRegisteredUsers: totalUsers,
    },
  });
});

/**
 * @desc Simulation helper for development/testing: manually activate/change plan
 * @route POST /api/subscriptions/dev-activate
 * @access Protected
 */
const devActivatePlan = asyncHandler(async (req, res) => {
  const { plan = 'BASIC', billingInterval = 'monthly' } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const normalizedPlan = plan.toUpperCase();
  const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let sub = await Subscription.findOne({ userId: user._id });
  if (!sub) {
    sub = new Subscription({
      userId: user._id,
      stripeCustomerId: user.stripeCustomerId || `cust_dev_${Date.now()}`,
      stripeSubscriptionId: `sub_dev_${Date.now()}`,
      plan: normalizedPlan,
      billingInterval,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
  } else {
    sub.plan = normalizedPlan;
    sub.billingInterval = billingInterval;
    sub.status = 'active';
    sub.currentPeriodEnd = currentPeriodEnd;
    sub.cancelAtPeriodEnd = false;
  }
  await sub.save();

  user.currentPlan = normalizedPlan;
  user.subscriptionStatus = 'active';
  user.subscriptionId = sub._id;
  user.subscriptionEndDate = currentPeriodEnd;
  await user.save();

  res.json({
    success: true,
    message: `Plan successfully set to ${normalizedPlan} (${billingInterval}) for test/demo mode.`,
    user: user.toSafeObject ? user.toSafeObject() : user,
    subscription: sub,
  });
});

module.exports = {
  getPlans,
  createCheckoutSession,
  getMySubscription,
  cancelSubscription,
  reactivateSubscription,
  createPortalSession,
  getAdminAnalytics,
  devActivatePlan,
};
