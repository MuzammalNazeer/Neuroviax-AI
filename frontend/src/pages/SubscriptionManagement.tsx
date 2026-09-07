import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Crown,
  RefreshCw,
  XCircle,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

interface SubscriptionDetails {
  currentPlan: string;
  status: string;
  billingInterval: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextBillingDate?: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planDetails?: any;
}

interface AdminAnalytics {
  totalSubscribers: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  failedPayments: number;
  monthlyRecurringRevenue: number;
  yearlySubscriptions: number;
  usersByPlan: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
  totalRegisteredUsers: number;
}

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sub, setSub] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchAnalytics();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscriptions/me');
      if (res.data?.subscription) {
        setSub(res.data.subscription);
      }
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/subscriptions/admin/analytics');
      if (res.data?.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      // Non-admin or analytics endpoint restricted
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/subscriptions/cancel');
      setMessage({
        type: 'success',
        text:
          res.data?.message ||
          'Your subscription will remain active until the end of the current billing period.',
      });
      setShowCancelModal(false);
      await fetchSubscription();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel subscription',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/subscriptions/reactivate');
      setMessage({
        type: 'success',
        text: res.data?.message || 'Subscription successfully reactivated!',
      });
      await fetchSubscription();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to reactivate subscription',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/subscriptions/portal');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Could not open Stripe customer portal. Please contact support.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isPaymentFailed = sub?.status === 'past_due' || sub?.status === 'unpaid';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p>Loading your subscription profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Subscription & Billing
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Stripe Billing
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your tier, recurring payments, payment methods, and invoices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/subscription/plans')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Change Plan
            </button>
            <button
              onClick={handleOpenCustomerPortal}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Billing Portal
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Alerts & Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Requirement 13: Payment Failure Banner */}
          {isPaymentFailed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-500/60 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-rose-950/50"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Your subscription payment failed. Please update your payment method.
                  </h3>
                  <p className="text-sm text-rose-300 mt-0.5">
                    We were unable to charge your card for the renewal period. Update your card now to avoid service interruption.
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenCustomerPortal}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white whitespace-nowrap shadow-lg shadow-rose-600/30 transition"
              >
                Update Payment Method
              </button>
            </motion.div>
          )}

          {/* Cancellation at Period End Notification Banner */}
          {sub?.cancelAtPeriodEnd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Cancellation Scheduled</h4>
                  <p className="text-sm text-amber-300 mt-0.5">
                    Your subscription will remain active until the end of the current billing period on{' '}
                    <strong className="text-white">{formatDate(sub.currentPeriodEnd)}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reactivate Subscription
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main User Dashboard Cards (Requirement 11) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Current Plan Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Plan
            </span>
            <div className="my-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white">{sub?.currentPlan || 'FREE'}</span>
                {sub?.currentPlan === 'PRO' && <Crown className="w-5 h-5 text-amber-400" />}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {sub?.currentPlan === 'FREE'
                  ? 'Complimentary Starter Tier'
                  : `${sub?.billingInterval === 'yearly' ? 'Annual' : 'Monthly'} Subscription`}
              </span>
            </div>
            <button
              onClick={() => navigate('/subscription/plans')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              Upgrade or Change Tier <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subscription Status Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Subscription Status
            </span>
            <div className="my-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  sub?.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isPaymentFailed
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : sub?.status === 'canceled'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {sub?.status || 'Active'}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                {sub?.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renewing active state'}
              </p>
            </div>
            <span className="text-xs text-slate-500">Verified with Stripe</span>
          </div>

          {/* Billing Interval Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Billing Interval
            </span>
            <div className="my-4">
              <span className="text-3xl font-black text-white capitalize">
                {sub?.billingInterval || 'Monthly'}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {sub?.billingInterval === 'yearly' ? 'Annual discount applied' : 'Monthly recurring'}
              </span>
            </div>
            <span className="text-xs text-slate-500">Recurring Stripe Billing</span>
          </div>

          {/* Next Billing Date / End Date Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {sub?.cancelAtPeriodEnd ? 'Subscription End Date' : 'Next Billing Date'}
            </span>
            <div className="my-4">
              <span className="text-xl font-bold text-white block">
                {formatDate(sub?.nextBillingDate || sub?.currentPeriodEnd)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {sub?.cancelAtPeriodEnd ? 'Access ends on this date' : 'Scheduled auto-renewal'}
              </span>
            </div>
            <span className="text-xs text-slate-500">Secured via Stripe Vault</span>
          </div>
        </div>

        {/* Subscription Controls & Actions */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Manage Subscription Actions</h3>
              <p className="text-slate-400 text-sm">
                Cancel, reactivate, or update your saved payment credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleOpenCustomerPortal}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <CreditCard className="w-4 h-4" />
              Manage Billing & Invoices
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {sub?.cancelAtPeriodEnd ? (
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reactivate Subscription
              </button>
            ) : sub?.currentPlan !== 'FREE' ? (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </button>
            ) : null}

            <button
              onClick={() => navigate('/subscription/plans')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              View All Plans
            </button>
          </div>
        </div>

        {/* Requirement 17: Admin Subscription Analytics */}
        {analytics && (
          <div className="mt-12 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Admin Subscription Intelligence</h3>
                  <p className="text-slate-400 text-sm">
                    Platform-wide MRR, subscriber volume, and retention tracking.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin Privilege
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Monthly MRR
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  ${analytics.monthlyRecurringRevenue}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Subscribers
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {analytics.totalSubscribers}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Active Subs
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {analytics.activeSubscriptions}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Annual Subs
                </span>
                <p className="text-2xl font-black text-indigo-400 mt-1">
                  {analytics.yearlySubscriptions}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Failed Payments
                </span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  {analytics.failedPayments}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Canceled
                </span>
                <p className="text-2xl font-black text-slate-400 mt-1">
                  {analytics.canceledSubscriptions}
                </p>
              </div>
            </div>

            {/* Users by Plan Breakdown */}
            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Users by Plan:
              </span>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Free Tier</span>
                  <span className="text-lg font-bold text-white">
                    {analytics.usersByPlan.FREE}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-400">Basic Tier</span>
                  <span className="text-lg font-bold text-white">
                    {analytics.usersByPlan.BASIC}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-400">Pro Enterprise</span>
                  <span className="text-lg font-bold text-white">{analytics.usersByPlan.PRO}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
            >
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Cancel Your Subscription?</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your subscription will remain active until the end of the current billing period (
                <strong className="text-white">{formatDate(sub?.currentPeriodEnd)}</strong>).
                After that, your account will revert to the Free Starter tier.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionManagement;
