import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Crown,
  Shield,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

interface Plan {
  id: string;
  name: string;
  badge: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  active: boolean;
  popular?: boolean;
  vip?: boolean;
}

const STATIC_FALLBACK_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    badge: 'STARTER',
    description: 'Essential access for individual users, clients, and solo practitioners.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    active: true,
    features: [
      'Basic case & document overview',
      'Client communication portal',
      'Up to 3 legal consultation bookings/mo',
      'Standard community support',
      'Email notifications',
    ],
  },
  {
    id: 'BASIC',
    name: 'Basic Professional',
    badge: 'POPULAR',
    description: 'Designed for active professionals and growing boutique law offices.',
    monthlyPrice: 29,
    yearlyPrice: 290,
    active: true,
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited client consultations & bookings',
      '50 AI Legal Drafting & research prompts/mo',
      'Client intake forms & document vault (10GB)',
      'Automated invoice generation & receipts',
      'Priority email & live chat support',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro Enterprise',
    badge: 'VIP ACCESS',
    description: 'Full autonomy for top-tier law firms, advocates, and high-volume corporate practices.',
    monthlyPrice: 79,
    yearlyPrice: 790,
    active: true,
    vip: true,
    features: [
      'Everything in Basic',
      'Unlimited Autonomous AI Legal Drafting & Analysis',
      'Automated Contract Risk Auditing & Clause Review',
      'Multi-party Escrow Workflows & Fast Disbursements',
      'Branded Client Portal with custom domain support',
      'Dedicated 24/7 Account Concierge & Phone Support',
      'Multi-lawyer team collaboration & RBAC permissions',
    ],
  },
];

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>(STATIC_FALLBACK_PLANS);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  const currentPlan = userSubscription?.currentPlan || user?.currentPlan || 'FREE';
  const subscriptionStatus = userSubscription?.status || user?.subscriptionStatus || 'active';

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscriptions/plans');
      if (res.data?.plans && Array.isArray(res.data.plans)) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.warn('Using local fallback plans:', err);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const res = await api.get('/subscriptions/me');
      if (res.data?.subscription) {
        setUserSubscription(res.data.subscription);
      }
    } catch (err) {
      // User might be logged out or network offline
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setError(null);

    // If already current plan, direct to management
    if (planId === currentPlan && subscriptionStatus === 'active') {
      navigate('/subscription/management');
      return;
    }

    if (planId === 'FREE') {
      navigate('/subscription/management');
      return;
    }

    setLoadingPlan(planId);

    try {
      // Security rule: Only send plan and interval. Backend determines Stripe Price ID.
      const res = await api.post('/subscriptions/checkout', {
        plan: planId,
        billingInterval,
      });

      if (res.data?.url) {
        // Redirect to Stripe Hosted Checkout or demo success page
        window.location.href = res.data.url;
      } else {
        setError('Unable to initiate checkout session. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed';
      setError(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getActionButtonText = (planId: string) => {
    if (planId === currentPlan && subscriptionStatus === 'active') {
      return 'Current Plan';
    }

    const planRanks: Record<string, number> = { FREE: 0, BASIC: 1, PRO: 2 };
    const currentRank = planRanks[currentPlan] || 0;
    const targetRank = planRanks[planId] || 0;

    if (targetRank > currentRank) {
      return targetRank === 2 ? 'Upgrade to Pro' : 'Subscribe to Basic';
    } else {
      return `Downgrade to ${planId}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent & Scalable Subscription Billing
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Predictable Plans for Modern Legal Teams
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          Scale your case volume, automate intake workflows, and unlock autonomous AI legal drafting with seamless Stripe subscriptions.
        </p>

        {/* Interval Switcher */}
        <div className="pt-6 flex items-center justify-center">
          <div className="relative flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`relative px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`relative flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm max-w-md mx-auto"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Plan Cards */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isPopular = plan.id === 'BASIC';
          const isPro = plan.id === 'PRO';
          const price =
            billingInterval === 'yearly'
              ? plan.yearlyPrice === 0
                ? '$0'
                : `$${Math.round(plan.yearlyPrice / 12)}`
              : `$${plan.monthlyPrice}`;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                isPro
                  ? 'bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/20'
                  : isPopular
                  ? 'bg-slate-900/90 border-2 border-indigo-600/60 shadow-xl'
                  : 'bg-slate-900/60 border border-slate-800'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isPro
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : isPopular
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {plan.badge || plan.id}
                </span>

                {isCurrent && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Plan
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {plan.name}
                  {isPro && <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" />}
                  {isPopular && <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />}
                </h3>
                <p className="mt-2 text-sm text-slate-400 min-h-[40px]">{plan.description}</p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {price}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">/ month</span>
                </div>
                {billingInterval === 'yearly' && plan.yearlyPrice > 0 && (
                  <p className="text-xs text-emerald-400 mt-1 font-medium">
                    Billed annually (${plan.yearlyPrice}/yr) • Save 20%
                  </p>
                )}
              </div>

              {/* Feature Checklist */}
              <div className="my-8 border-t border-slate-800/80 pt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Included Features:
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-0.5 bg-indigo-500/20 text-indigo-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to action button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingPlan !== null || (isCurrent && subscriptionStatus === 'active')}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isCurrent && subscriptionStatus === 'active'
                    ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                    : isPro
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30'
                    : isPopular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to Stripe...
                  </>
                ) : (
                  <>
                    {getActionButtonText(plan.id)}
                    {!isCurrent && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer helper & management link */}
      <div className="max-w-3xl mx-auto mt-14 text-center border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Stripe 256-bit SSL billing. Cancel anytime.</span>
        </div>
        <button
          onClick={() => navigate('/subscription/management')}
          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition font-medium"
        >
          Manage Existing Subscription & Invoices
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
