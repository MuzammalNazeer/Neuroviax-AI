/**
 * Automated Verification Script for Stripe Subscription & Recurring Payment System
 */
require('dotenv').config();
const { PLANS, getPriceId, getPublicPlans } = require('./config/stripe');
const {
  hasActiveSubscription,
  hasPlan,
  canAccessFeature,
} = require('./middleware/subscriptionAccess');
const {
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} = require('./controllers/webhookController');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING STRIPE SUBSCRIPTION SUITE TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Plans Configuration
  try {
    const publicPlans = getPublicPlans();
    assert(publicPlans.length === 3, 'Exposes exactly 3 subscription plans: FREE, BASIC, PRO');
    assert(publicPlans.some((p) => p.id === 'FREE' && p.monthlyPrice === 0), 'FREE plan has $0 monthly price');
    assert(publicPlans.some((p) => p.id === 'BASIC' && p.monthlyPrice === 29), 'BASIC plan has $29 monthly price');
    assert(publicPlans.some((p) => p.id === 'PRO' && p.monthlyPrice === 79), 'PRO plan has $79 monthly price');
  } catch (err) {
    assert(false, `Plan configuration error: ${err.message}`);
  }

  // TEST 2: Price ID Security Mapping (Server-side price enforcement)
  try {
    const basicMonthlyPrice = getPriceId('BASIC', 'monthly');
    const basicYearlyPrice = getPriceId('BASIC', 'yearly');
    const proMonthlyPrice = getPriceId('PRO', 'monthly');
    const proYearlyPrice = getPriceId('PRO', 'yearly');

    assert(Boolean(basicMonthlyPrice), 'Resolves BASIC monthly Stripe Price ID securely');
    assert(Boolean(basicYearlyPrice), 'Resolves BASIC yearly Stripe Price ID securely');
    assert(Boolean(proMonthlyPrice), 'Resolves PRO monthly Stripe Price ID securely');
    assert(Boolean(proYearlyPrice), 'Resolves PRO yearly Stripe Price ID securely');

    let threwOnInvalid = false;
    try {
      getPriceId('SUPER_VIP');
    } catch {
      threwOnInvalid = true;
    }
    assert(threwOnInvalid, 'Rejects unauthorized arbitrary plan names securely');
  } catch (err) {
    assert(false, `Price ID mapping error: ${err.message}`);
  }

  // TEST 3: User Model Subscription Fields
  try {
    const userSchema = User.schema.obj;
    assert('currentPlan' in userSchema, 'User schema contains currentPlan');
    assert('subscriptionStatus' in userSchema, 'User schema contains subscriptionStatus');
    assert('subscriptionId' in userSchema, 'User schema contains subscriptionId reference');
    assert('subscriptionEndDate' in userSchema, 'User schema contains subscriptionEndDate');
    assert('stripeCustomerId' in userSchema, 'User schema contains stripeCustomerId');
  } catch (err) {
    assert(false, `User schema error: ${err.message}`);
  }

  // TEST 4: Subscription Model Fields & Statuses
  try {
    const subSchema = Subscription.schema.obj;
    assert('userId' in subSchema, 'Subscription schema contains userId');
    assert('stripeCustomerId' in subSchema, 'Subscription schema contains stripeCustomerId');
    assert('stripeSubscriptionId' in subSchema, 'Subscription schema contains stripeSubscriptionId');
    assert('plan' in subSchema, 'Subscription schema contains plan');
    assert('billingInterval' in subSchema, 'Subscription schema contains billingInterval');
    assert('status' in subSchema, 'Subscription schema contains status');
    assert('cancelAtPeriodEnd' in subSchema, 'Subscription schema contains cancelAtPeriodEnd');
  } catch (err) {
    assert(false, `Subscription schema error: ${err.message}`);
  }

  console.log('\n------------------------------------------------------');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
