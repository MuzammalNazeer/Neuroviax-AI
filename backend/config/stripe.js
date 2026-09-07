const Stripe = require('stripe');

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Master definition of subscription plans
const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free Starter',
    badge: 'STARTER',
    description: 'Essential access for individual users, clients, and solo practitioners.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: null,
    yearlyPriceId: null,
    stripeProductId: 'prod_free_tier',
    active: true,
    features: [
      'Basic case & document overview',
      'Client communication portal',
      'Up to 3 legal consultation bookings/mo',
      'Standard community support',
      'Email notifications',
    ],
    entitlements: {
      aiDrafting: false,
      contractReview: false,
      priorityScheduling: false,
      escrowProtection: false,
      dedicatedSupport: false,
      analyticsExport: false,
    },
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic Professional',
    badge: 'POPULAR',
    description: 'Designed for active professionals and growing boutique law offices.',
    monthlyPrice: 29,
    yearlyPrice: 290, // $24/mo effective
    get monthlyPriceId() {
      return process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly_placeholder';
    },
    get yearlyPriceId() {
      return process.env.STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly_placeholder';
    },
    stripeProductId: process.env.STRIPE_BASIC_PRODUCT_ID || 'prod_basic_tier',
    active: true,
    features: [
      'Everything in Free',
      'Unlimited client consultations & bookings',
      '50 AI Legal Drafting & research prompts/mo',
      'Client intake forms & document vault (10GB)',
      'Automated invoice generation & receipts',
      'Priority email & live chat support',
    ],
    entitlements: {
      aiDrafting: true,
      contractReview: false,
      priorityScheduling: true,
      escrowProtection: true,
      dedicatedSupport: false,
      analyticsExport: true,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Enterprise',
    badge: 'VIP ACCESS',
    description: 'Full autonomy for top-tier law firms, advocates, and high-volume corporate practices.',
    monthlyPrice: 79,
    yearlyPrice: 790, // $65/mo effective
    get monthlyPriceId() {
      return process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_placeholder';
    },
    get yearlyPriceId() {
      return process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly_placeholder';
    },
    stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID || 'prod_pro_tier',
    active: true,
    features: [
      'Everything in Basic',
      'Unlimited Autonomous AI Legal Drafting & Analysis',
      'Automated Contract Risk Auditing & Clause Review',
      'Multi-party Escrow Workflows & Fast Disbursements',
      'Branded Client Portal with custom domain support',
      'Dedicated 24/7 Account Concierge & Phone Support',
      'Multi-lawyer team collaboration & RBAC permissions',
    ],
    entitlements: {
      aiDrafting: true,
      contractReview: true,
      priorityScheduling: true,
      escrowProtection: true,
      dedicatedSupport: true,
      analyticsExport: true,
    },
  },
};

/**
 * Resolves the server-validated Stripe Price ID for a plan and interval
 * Prevents clients from supplying arbitrary price amounts or invalid tiers
 */
const getPriceId = (plan, billingInterval = 'monthly') => {
  const normalizedPlan = (plan || '').toUpperCase();
  const normalizedInterval = (billingInterval || 'monthly').toLowerCase();

  const planConfig = PLANS[normalizedPlan];
  if (!planConfig) {
    throw new Error(`Invalid plan specified: ${plan}. Allowed plans: FREE, BASIC, PRO.`);
  }

  if (normalizedPlan === 'FREE') {
    return null;
  }

  if (normalizedInterval === 'yearly') {
    return planConfig.yearlyPriceId;
  }
  return planConfig.monthlyPriceId;
};

/**
 * Returns formatted plans for public display
 */
const getPublicPlans = () => {
  return Object.values(PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    badge: p.badge,
    description: p.description,
    monthlyPrice: p.monthlyPrice,
    yearlyPrice: p.yearlyPrice,
    features: p.features,
    active: p.active,
    entitlements: p.entitlements,
  }));
};

module.exports = {
  stripe,
  PLANS,
  getPriceId,
  getPublicPlans,
};
