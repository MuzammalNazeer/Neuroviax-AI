const admin = require('firebase-admin');

let firestore = null;
let auth = null;

try {
  const apps = admin.apps || [];
  if (apps.length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firestore = admin.firestore();
      auth = admin.auth();
      console.log('[Firebase Admin] Initialized with Service Account');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
      firestore = admin.firestore();
      auth = admin.auth();
      console.log('[Firebase Admin] Initialized with Application Default Credentials');
    } else if (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'neuroviax-a158e',
      });
      firestore = admin.firestore();
      auth = admin.auth();
      console.log('[Firebase Admin] Initialized with Project ID');
    }
  } else {
    firestore = admin.firestore();
    auth = admin.auth();
  }
} catch (err) {
  console.warn('[Firebase Admin] Optional initialization note:', err.message);
}

/**
 * Sync active subscription status to Firebase Firestore using Two-Tier structure:
 * 1. Root: users/{userId} (profile & customer IDs)
 * 2. Subcollection: users/{userId}/subscriptions/{subscriptionId} (active plan, role, period_end, status)
 */
async function syncSubscriptionToFirestore(userId, subData) {
  if (!firestore || !userId) return;
  try {
    const userDocRef = firestore.collection('users').doc(userId.toString());
    const subId = subData.stripeSubscriptionId || `sub_${Date.now()}`;

    // 1. Update Subcollection document: users/{userId}/subscriptions/{subId}
    const subDocRef = userDocRef.collection('subscriptions').doc(subId.toString());
    await subDocRef.set(
      {
        status: subData.status || 'active',
        role: (subData.plan || 'BASIC').toLowerCase(),
        plan: subData.plan || 'BASIC',
        price_id: subData.price_id || subData.stripePriceId || null,
        billingInterval: subData.billingInterval || 'monthly',
        stripeCustomerId: subData.stripeCustomerId || null,
        stripeSubscriptionId: subData.stripeSubscriptionId || null,
        current_period_start: subData.currentPeriodStart || new Date(),
        current_period_end: subData.currentPeriodEnd || null,
        cancel_at_period_end: Boolean(subData.cancelAtPeriodEnd),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // 2. Update Root document: users/{userId} (Shallow metadata cache)
    await userDocRef.set(
      {
        stripeCustomerId: subData.stripeCustomerId || null,
        currentPlan: subData.plan || 'BASIC',
        subscriptionStatus: subData.status || 'active',
        subscriptionEndDate: subData.currentPeriodEnd || null,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`[Firestore Sync] Successfully saved two-tier subscription: users/${userId}/subscriptions/${subId} (status=${subData.status || 'active'}, plan=${subData.plan})`);
  } catch (err) {
    console.warn(`[Firestore Sync] Sync skipped or notice: ${err.message}`);
  }
}

module.exports = {
  admin,
  firestore,
  auth,
  syncSubscriptionToFirestore,
};
