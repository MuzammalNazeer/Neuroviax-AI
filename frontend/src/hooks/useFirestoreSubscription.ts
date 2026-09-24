import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';

export interface FirestoreSubscription {
  id: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete';
  role?: string;
  plan: 'FREE' | 'BASIC' | 'PRO' | string;
  price_id?: string;
  billingInterval?: 'monthly' | 'yearly';
  current_period_start?: any;
  current_period_end?: any;
  cancel_at_period_end?: boolean;
}

/**
 * Custom React Hook to listen to user's two-tier Firestore subscription in real-time
 * Structure: users/{userId}/subscriptions/{subscriptionId}
 */
export function useFirestoreSubscription() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<FirestoreSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !user?._id) {
      setLoading(false);
      return;
    }

    try {
      const subsRef = collection(db, 'users', user._id.toString(), 'subscriptions');
      const q = query(subsRef, where('status', 'in', ['active', 'trialing']));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data() as Omit<FirestoreSubscription, 'id'>;
            setSubscription({ id: doc.id, ...data });
          } else {
            setSubscription(null);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('[Firestore Subscription] Listener notice:', err.message);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [user?._id]);

  const isSubscribed = Boolean(subscription && (subscription.status === 'active' || subscription.status === 'trialing'));
  const currentPlan = (subscription?.plan || user?.currentPlan || 'FREE').toUpperCase();
  const isPro = isSubscribed && currentPlan === 'PRO';
  const isBasic = isSubscribed && (currentPlan === 'BASIC' || currentPlan === 'PRO');

  return {
    subscription,
    isSubscribed,
    currentPlan,
    isPro,
    isBasic,
    loading,
    error,
  };
}

export default useFirestoreSubscription;
