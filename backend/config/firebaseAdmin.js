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
 * Sync active subscription status to Firebase Firestore user document
 */
async function syncSubscriptionToFirestore(userId, subData) {
  if (!firestore || !userId) return;
  try {
    const userRef = firestore.collection('users').doc(userId.toString());
    await userRef.set(
      {
        status: subData.status || 'active',
        subscriptionStatus: subData.status || 'active',
        currentPlan: subData.plan || 'BASIC',
        billingInterval: subData.billingInterval || 'monthly',
        stripeCustomerId: subData.stripeCustomerId || null,
        stripeSubscriptionId: subData.stripeSubscriptionId || null,
        subscriptionEndDate: subData.currentPeriodEnd || null,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    console.log(`[Firestore Sync] Successfully synced user ${userId} with status=${subData.status || 'active'}, plan=${subData.plan}`);
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
