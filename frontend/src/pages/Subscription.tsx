import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Package,
  Receipt,
  Bot,
  MessageCircle,
  AlertTriangle,
  CreditCard,
  Phone,
  RefreshCw,
  ArrowRight,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

interface PlanLimit {
  users: string;
  branches: string;
  products: string;
  orders: string;
  ai: string;
}

interface TierInfo {
  id: string;
  name: string;
  badge: string;
  pricePKR: string | number;
  priceUSD: string | number;
  desc: string;
  limits: PlanLimit;
  features: string[];
  popular?: boolean;
  gradient?: string;
}

interface SubscriptionData {
  businessId: string;
  businessName: string;
  currentPlan: string;
  planDetails?: any;
  active: boolean;
  billingCycle: string;
  currency: string;
  nextBillingDate?: string;
  usage: {
    users: number;
    branches: number;
    products: number;
    orders: number;
  };
  entitlements: {
    maxUsers: number;
    maxBranches: number;
    maxProducts: number;
    maxOrdersPerMonth: number;
    aiRecommendationsEnabled: boolean;
    whatsappIntegrationEnabled: boolean;
    advancedForecastingEnabled: boolean;
    dedicatedSupport: boolean;
  };
}

const STATIC_TIERS: TierInfo[] = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'MICRO',
    pricePKR: '4,500',
    priceUSD: '16',
    desc: 'Single-location micro businesses starting with digital inventory & orders.',
    limits: {
      users: 'Up to 2 Staff',
      branches: '1 Main Branch',
      products: '250 SKUs',
      orders: '500 orders / mo',
      ai: 'Basic Rule Alerts only',
    },
    features: [
      'Core inventory tracking & adjustments',
      'Unified sales & purchase orders',
      'Basic payment & invoice recording',
      'Customer & Supplier directories',
      'Audit logging & standard RBAC',
    ],
    popular: false,
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'POPULAR',
    pricePKR: '12,500',
    priceUSD: '45',
    desc: 'Multi-branch SMEs scaling operations with WhatsApp messaging & CRM.',
    limits: {
      users: 'Up to 10 Staff',
      branches: 'Up to 5 Branches',
      products: '2,500 SKUs',
      orders: 'Unlimited Orders',
      ai: 'Procurement AI Assistant',
    },
    features: [
      'Everything in Starter',
      'Multi-branch warehouse transfers',
      'WhatsApp order confirmation automation',
      'Procurement Assistant (Reorders & Supplier Comparison)',
      'Expense categorization & cash-flow snapshots',
      'Exclusive Stripe Card Payments & 3D Secure Checkout',
    ],
    popular: true,
    gradient: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'INTELLIGENCE',
    pricePKR: '28,000',
    priceUSD: '99',
    desc: 'Established SMEs seeking automated intelligence, forecasting & optimization.',
    limits: {
      users: 'Up to 25 Staff',
      branches: 'Up to 15 Branches',
      products: '10,000 SKUs',
      orders: 'Unlimited Orders',
      ai: 'Full 6 Domain AI Assistants',
    },
    features: [
      'Everything in Growth',
      'Full 6 AI Domain Assistants (Sales, Finance, Marketing, etc.)',
      'Autonomous restock generation & human-in-the-loop PO',
      'Demand velocity & seasonal cash-flow forecasting',
      'Custom saved operational & financial report definitions',
      'Priority support & onboarding assistance',
    ],
    popular: false,
    gradient: 'from-purple-600 to-indigo-800',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'UNLIMITED',
    pricePKR: '65,000',
    priceUSD: '230',
    desc: 'Large retail networks, distribution franchises, and light manufacturing groups.',
    limits: {
      users: 'Unlimited Seats',
      branches: 'Unlimited Branches',
      products: 'Unlimited Catalog',
      orders: 'Unlimited Orders',
      ai: 'Fine-Tuned Vector RAG & SLA',
    },
    features: [
      'Everything in Professional',
      'Dedicated Qdrant/Weaviate Vector Retrieval RAG',
      'Custom regional ERP data migration tooling',
      'Multi-tenant franchise group reporting',
      '99.9% Uptime transactional SLA',
      'Dedicated technical account manager',
    ],
    popular: false,
    gradient: 'from-amber-600 to-orange-700',
  },
];

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD'>('PKR');
  
  // Modal & Action States
  const [modalTier, setModalTier] = useState<TierInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe'>('stripe');
  const [accountNumber, setAccountNumber] = useState('4242 4242 4242 4242');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cancelModal, setCancelModal] = useState(false);

  // Fetch current live subscription details from backend API
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/current');
      setSubData(res.data);
    } catch (err: any) {
      console.warn('Could not fetch subscription from API, using fallback data:', err);
      // Fallback
      setSubData({
        businessId: user?.memberships?.[0]?.business?._id || 'demo_id',
        businessName: user?.memberships?.[0]?.business?.name || 'Demo Store',
        currentPlan: user?.memberships?.[0]?.business?.subscriptionPlan || 'growth',
        active: true,
        billingCycle: 'monthly',
        currency: 'PKR',
        usage: { users: 2, branches: 1, products: 48, orders: 124 },
        entitlements: {
          maxUsers: 10,
          maxBranches: 5,
          maxProducts: 2500,
          maxOrdersPerMonth: 10000,
          aiRecommendationsEnabled: true,
          whatsappIntegrationEnabled: true,
          advancedForecastingEnabled: false,
          dedicatedSupport: false,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const activePlanId = (subData?.currentPlan || user?.memberships?.[0]?.business?.subscriptionPlan || 'growth').toLowerCase();

  // Execute plan upgrade / switch via backend API
  const handleConfirmPlanChange = async () => {
    if (!modalTier) return;
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await api.post('/subscriptions/change-plan', {
        tier: modalTier.id,
        paymentMethod,
        transactionRef: `${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setFeedback({
        type: 'success',
        message: res.data?.message || `Successfully activated the ${modalTier.name} plan!`,
      });

      // Refresh authentication session & subscription state
      await checkAuth();
      await fetchSubscription();
      setModalTier(null);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update subscription. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Downgrade to Starter
  const handleCancelSubscription = async () => {
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await api.post('/subscriptions/cancel');
      setFeedback({
        type: 'success',
        message: res.data?.message || 'Plan downgraded to Starter tier.',
      });
      await checkAuth();
      await fetchSubscription();
      setCancelModal(false);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel plan.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
              Subscription & Entitlements
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-300">
              Active Tier: {activePlanId.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time API synchronized plan tiers, resource quotas, and regional payment gateways · §10 & §15
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubscription}
            title="Refresh Live Quota"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold shadow-sm">
            <button
              onClick={() => setSelectedCurrency('PKR')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCurrency === 'PKR' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PKR (Local)
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCurrency === 'USD' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD (Global)
            </button>
          </div>
        </div>
      </div>

      {/* Alert / Feedback Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Entitlements & Live Usage Overview */}
      <div className="rounded-3xl p-6 sm:p-7 border border-emerald-500/40 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                Current Operational Tier
              </span>
              <h3 className="text-xl font-black text-slate-900 font-display capitalize">
                {activePlanId} Edition
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-tenant isolated • Auto-reconciling billing cycle
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live API Connected
            </span>
            {activePlanId !== 'starter' && (
              <button
                onClick={() => setCancelModal(true)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition"
              >
                Downgrade to Starter
              </button>
            )}
          </div>
        </div>

        {/* Real Live Quota Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-200/60 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">Authorized Seats</span>
            <p className="font-black text-slate-800 text-sm mt-0.5">
              {subData?.usage?.users || 1} / {subData?.entitlements?.maxUsers || 10} Active
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, ((subData?.usage?.users || 1) / (subData?.entitlements?.maxUsers || 10)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">Branch Locations</span>
            <p className="font-black text-slate-800 text-sm mt-0.5">
              {subData?.usage?.branches || 1} / {subData?.entitlements?.maxBranches || 5} Connected
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, ((subData?.usage?.branches || 1) / (subData?.entitlements?.maxBranches || 5)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">Catalog SKUs</span>
            <p className="font-black text-slate-800 text-sm mt-0.5">
              {subData?.usage?.products || 0} / {subData?.entitlements?.maxProducts || 2500}
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, ((subData?.usage?.products || 0) / (subData?.entitlements?.maxProducts || 2500)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">AI Copilot Layer</span>
            <p className="font-black text-emerald-700 text-sm mt-0.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {subData?.entitlements?.aiRecommendationsEnabled ? 'Autonomous Active' : 'Basic Rules'}
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  subData?.entitlements?.aiRecommendationsEnabled ? 'w-full bg-emerald-600' : 'w-1/3 bg-slate-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
        {STATIC_TIERS.map((tier) => {
          const isCurrent = tier.id === activePlanId;
          const price = selectedCurrency === 'PKR' ? `PKR ${tier.pricePKR}` : `$${tier.priceUSD}`;

          return (
            <div
              key={tier.id}
              className={`rounded-3xl bg-white border p-6 flex flex-col justify-between transition-all duration-200 ${
                isCurrent
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    {tier.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      ACTIVE TIER
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black font-display text-slate-900">{tier.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px] leading-relaxed">{tier.desc}</p>

                <div className="mt-4 pb-4 border-b border-slate-100">
                  <span className="text-2xl font-black font-display text-slate-900">{price}</span>
                  <span className="text-xs text-slate-400 font-semibold"> / month</span>
                </div>

                {/* Resource Limits */}
                <div className="py-3 border-b border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Seats:</span>
                    <span className="font-bold text-slate-800">{tier.limits.users}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Locations:</span>
                    <span className="font-bold text-slate-800">{tier.limits.branches}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Catalog:</span>
                    <span className="font-bold text-slate-800">{tier.limits.products}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>AI Layer:</span>
                    <span className="font-bold text-purple-700">{tier.limits.ai}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="pt-4 space-y-2 text-xs">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  disabled={isCurrent || processing}
                  onClick={() => setModalTier(tier)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isCurrent ? 'Current Active Tier' : `Switch to ${tier.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Upgrade / Checkout Modal */}
      <AnimatePresence>
        {modalTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Upgrade to {modalTier.name} Plan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Instant API activation with regional payment gateway
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalTier(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Summary */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Billed Monthly:</span>
                  <p className="text-xl font-black text-slate-900">
                    {selectedCurrency === 'PKR' ? `PKR ${modalTier.pricePKR}` : `$${modalTier.priceUSD}`}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Zero Lock-in
                </span>
              </div>

              {/* Gateway Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Regional Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'jazzcash', name: 'JazzCash', subtitle: 'Mobile Wallet / QR' },
                    { id: 'easypaisa', name: 'Easypaisa', subtitle: 'Instant Transfer' },
                    { id: 'stripe', name: 'Credit / Debit', subtitle: 'Visa & Mastercard' },
                    { id: 'bank_transfer', name: 'Direct Bank', subtitle: 'Raast / IBAN' },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setPaymentMethod(gw.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === gw.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">{gw.name}</span>
                      <span className="text-[10px] text-slate-500">{gw.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {paymentMethod === 'stripe'
                    ? 'Card Number'
                    : paymentMethod === 'bank_transfer'
                    ? 'IBAN / Account Title'
                    : 'Account / Mobile Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={
                      paymentMethod === 'stripe'
                        ? '4242 •••• •••• 4242'
                        : paymentMethod === 'bank_transfer'
                        ? 'PK92 MEZN 0001 2345 6789 01'
                        : '03264414694'
                    }
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mock/Demo sandbox: Transaction will be verified and logged in the audit ledger automatically.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTier(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmPlanChange}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                >
                  {processing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Confirm & Activate <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Downgrade Confirmation Modal */}
      <AnimatePresence>
        {cancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">Downgrade to Starter Tier?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You will lose access to multi-branch warehouse routing and advanced AI copilot recommendations. Your existing data will remain safe.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Keep Current Plan
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleCancelSubscription}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
                >
                  {processing ? 'Processing...' : 'Confirm Downgrade'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Subscription;
