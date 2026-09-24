const { stripe, PLANS } = require('../config/stripe');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { syncSubscriptionToFirestore } = require('../config/firebaseAdmin');

// In-memory set to store recently processed event IDs for duplicate event protection / idempotency
const processedEvents = new Set();
const MAX_SAVED_EVENTS = 2000;

/**
 * Handle Stripe Webhook Events
 * POST /api/webhooks/stripe
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) {
      console.warn('[Stripe Webhook] Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
      // In dev or test environments where secrets are placeholders, construct basic payload if raw json
      if (process.env.NODE_ENV === 'development' && typeof req.body === 'object' && req.body.type) {
        event = req.body;
      } else {
        return res.status(400).send(`Webhook Error: Missing signature or webhook secret.`);
      }
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Signature Verification Error: ${err.message}`);
  }

  // Idempotency: Prevent duplicate processing of the exact same event ID
  if (event.id && processedEvents.has(event.id)) {
    console.log(`[Stripe Webhook] Duplicate event ignored: ${event.id}`);
    return res.status(200).json({ received: true, duplicate: true });
  }

  if (event.id) {
    processedEvents.add(event.id);
    if (processedEvents.size > MAX_SAVED_EVENTS) {
      const oldestId = processedEvents.values().next().value;
      processedEvents.delete(oldestId);
    }
  }

  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const stripeSub = event.data.object;
        await handleSubscriptionUpdated(stripeSub);
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object;
        await handleSubscriptionDeleted(stripeSub);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook Error] Handler error: ${err.message}`, err.stack);
    return res.status(500).json({ message: 'Internal error processing webhook' });
  }
};

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutSessionCompleted(session) {
  if (session.mode !== 'subscription') {
    // Transactional payments are handled by the separate payments system
    return;
  }

  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan || 'BASIC';
  const billingInterval = session.metadata?.billingInterval || 'monthly';
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;

  if (!userId) {
    console.warn('[Stripe Webhook] checkout.session.completed missing userId in metadata');
    return;
  }

  let stripeSub = null;
  if (stripeSubscriptionId) {
    try {
      stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (err) {
      console.warn(`[Stripe Webhook] Could not retrieve stripe sub ${stripeSubscriptionId}: ${err.message}`);
    }
  }

  const currentPeriodStart = stripeSub?.current_period_start
    ? new Date(stripeSub.current_period_start * 1000)
    : new Date();
  const currentPeriodEnd = stripeSub?.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const stripePriceId = stripeSub?.items?.data?.[0]?.price?.id || null;

  // Upsert Subscription in MongoDB
  let subscription = await Subscription.findOne({
    $or: [{ stripeSubscriptionId }, { userId }],
  });

  if (!subscription) {
    subscription = new Subscription({
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      plan,
      billingInterval,
      status: stripeSub?.status || 'active',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSub?.cancel_at_period_end || false,
    });
  } else {
    subscription.stripeCustomerId = stripeCustomerId;
    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.stripePriceId = stripePriceId || subscription.stripePriceId;
    subscription.plan = plan;
    subscription.billingInterval = billingInterval;
    subscription.status = stripeSub?.status || 'active';
    subscription.currentPeriodStart = currentPeriodStart;
    subscription.currentPeriodEnd = currentPeriodEnd;
    subscription.cancelAtPeriodEnd = stripeSub?.cancel_at_period_end || false;
  }

  await subscription.save();

  // Synchronize User model
  await User.findByIdAndUpdate(userId, {
    stripeCustomerId,
    currentPlan: plan,
    subscriptionStatus: subscription.status,
    subscriptionId: subscription._id,
    subscriptionEndDate: currentPeriodEnd,
  });

  // Synchronize to Firebase Firestore
  await syncSubscriptionToFirestore(userId, {
    status: subscription.status || 'active',
    plan,
    billingInterval,
    stripeCustomerId,
    stripeSubscriptionId,
    currentPeriodEnd,
  });

  console.log(`[Stripe Webhook] User ${userId} upgraded to ${plan} (${billingInterval})`);
}

/**
 * Handle customer.subscription.created / customer.subscription.updated
 */
async function handleSubscriptionUpdated(stripeSub) {
  const stripeSubscriptionId = stripeSub.id;
  const stripeCustomerId = stripeSub.customer;
  const status = stripeSub.status;
  const currentPeriodStart = stripeSub.current_period_start
    ? new Date(stripeSub.current_period_start * 1000)
    : undefined;
  const currentPeriodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : undefined;
  const cancelAtPeriodEnd = Boolean(stripeSub.cancel_at_period_end);
  const canceledAt = stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null;
  const stripePriceId = stripeSub.items?.data?.[0]?.price?.id;
  const billingInterval = stripeSub.items?.data?.[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly';

  // Find plan by priceId or metadata
  let resolvedPlan = stripeSub.metadata?.plan;
  if (!resolvedPlan && stripePriceId) {
    if (
      stripePriceId === PLANS.PRO.monthlyPriceId ||
      stripePriceId === PLANS.PRO.yearlyPriceId
    ) {
      resolvedPlan = 'PRO';
    } else if (
      stripePriceId === PLANS.BASIC.monthlyPriceId ||
      stripePriceId === PLANS.BASIC.yearlyPriceId
    ) {
      resolvedPlan = 'BASIC';
    }
  }

  let subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (!subscription) {
    subscription = await Subscription.findOne({ stripeCustomerId });
  }

  if (subscription) {
    subscription.status = status;
    if (resolvedPlan) subscription.plan = resolvedPlan;
    if (billingInterval) subscription.billingInterval = billingInterval;
    if (stripePriceId) subscription.stripePriceId = stripePriceId;
    if (currentPeriodStart) subscription.currentPeriodStart = currentPeriodStart;
    if (currentPeriodEnd) subscription.currentPeriodEnd = currentPeriodEnd;
    subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
    subscription.canceledAt = canceledAt;
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      currentPlan: subscription.plan,
      subscriptionStatus: status,
      subscriptionEndDate: currentPeriodEnd,
    });

    // Synchronize to Firebase Firestore
    if (subscription.userId) {
      await syncSubscriptionToFirestore(subscription.userId, {
        status,
        plan: subscription.plan,
        billingInterval: subscription.billingInterval,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        currentPeriodEnd: subscription.currentPeriodEnd,
      });
    }

    console.log(`[Stripe Webhook] Subscription ${stripeSubscriptionId} updated to status: ${status}`);
  }
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(stripeSub) {
  const stripeSubscriptionId = stripeSub.id;

  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (subscription) {
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      currentPlan: 'FREE',
      subscriptionStatus: 'canceled',
    });

    console.log(`[Stripe Webhook] Subscription ${stripeSubscriptionId} deleted. User downgraded to FREE.`);
  }
}

/**
 * Handle invoice.paid
 */
async function handleInvoicePaid(invoice) {
  const stripeSubscriptionId = invoice.subscription;
  if (!stripeSubscriptionId) return;

  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (subscription) {
    subscription.status = 'active';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'active',
    });

    console.log(`[Stripe Webhook] Invoice paid for subscription ${stripeSubscriptionId}`);
  }
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice) {
  const stripeSubscriptionId = invoice.subscription;
  if (!stripeSubscriptionId) return;

  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (subscription) {
    subscription.status = 'past_due';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'past_due',
    });

    console.warn(`[Stripe Webhook] Invoice payment failed for subscription ${stripeSubscriptionId}. Marked past_due.`);
  }
}

module.exports = {
  handleStripeWebhook,
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
};
