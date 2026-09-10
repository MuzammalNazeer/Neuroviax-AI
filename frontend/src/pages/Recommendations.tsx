import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Boxes,
  Truck,
  ArrowRight,
  Zap,
  RefreshCw,
  Activity,
  ChevronRight,
  ShoppingBag,
  Users,
  History,
  TrendingUp,
  MessageCircle,
  Layers,
  Star,
  ExternalLink,
  Package,
} from 'lucide-react';

interface Recommendation {
  _id: string;
  assistant: string;
  riskTier: 'low' | 'medium' | 'high';
  action: string;
  rationale: string;
  confidenceScore: number;
  status: string;
  relatedProduct?: { name: string; sku: string };
  relatedSupplier?: { name: string };
  payload: { suggestedQuantity?: number; estimatedCost?: number };
  createdAt: string;
}

interface RecommendedProductItem {
  product: {
    _id: string;
    name: string;
    sku: string;
    category?: string;
    unit?: string;
    sellPrice?: number;
    costPrice?: number;
  };
  algorithm: string;
  confidenceScore: number;
  similarityScore: number;
  rationale: string;
  potentialBasketUplift: string;
  coPurchasesCount: number;
}

interface CustomerHistoryData {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  totalOrders: number;
  totalSpend: number;
  distinctProductsCount: number;
  lastPurchaseDate: string | null;
  favoriteCategories: Record<string, number>;
  purchasedProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    category: string;
    purchaseCount: number;
    totalQuantity: number;
    totalSpend: number;
  }>;
}

interface CustomerRecommendationGroup {
  customer: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  history: CustomerHistoryData;
  recommendations: RecommendedProductItem[];
}

interface CollaborativeFilteringResponse {
  engine: string;
  algorithm: string;
  totalCustomersEvaluated: number;
  totalProductsCatalog: number;
  totalOrdersAnalyzed: number;
  customerRecommendations: CustomerRecommendationGroup[];
}

const riskBadges = {
  low: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck, label: 'Low Risk · Auto-notify' },
  medium: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Medium Risk · Bounded auto' },
  high: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert, label: 'High Risk · Human approval' },
};

// §7.1 Lifecycle steps (mini version)
const LIFECYCLE_MINI = [
  { label: 'Signal', icon: Zap, color: 'text-slate-600 bg-slate-100' },
  { label: 'Analyze', icon: Activity, color: 'text-blue-600 bg-blue-50' },
  { label: 'Generate', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
  { label: 'Route', icon: ArrowRight, color: 'text-amber-600 bg-amber-50' },
  { label: 'Feedback', icon: RefreshCw, color: 'text-emerald-600 bg-emerald-50' },
];

// §7.2 Risk tiers (mini version)
const RISK_TIERS_MINI = [
  { level: 'Low', example: 'Flag low stock, draft reorder', autonomy: 'Fully autonomous', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: ShieldCheck },
  { level: 'Medium', example: 'Send payment reminder, apply discount tier', autonomy: 'Autonomous within limits', color: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle },
  { level: 'High', example: 'Place PO above threshold, issue refund', autonomy: 'Explicit human approval', color: 'bg-rose-50 border-rose-200 text-rose-800', icon: ShieldAlert },
];

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'collaborative' | 'procurement'>('collaborative');

  // Procurement Action Queue State
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Collaborative Filtering State
  const [cfData, setCfData] = useState<CollaborativeFilteringResponse | null>(null);
  const [selectedCustIdx, setSelectedCustIdx] = useState<number>(0);
  const [cfLoading, setCfLoading] = useState(false);

  const loadProcurement = () => {
    setLoading(true);
    api
      .get('/ai/recommendations', { params: statusFilter === 'all' ? {} : { status: statusFilter } })
      .then((r) => setRecs(r.data))
      .finally(() => setLoading(false));
  };

  const loadCollaborative = async () => {
    setCfLoading(true);
    try {
      const res = await api.get('/ai/product-recommendations');
      setCfData(res.data);
    } catch (err: any) {
      console.error('Failed to load collaborative filtering:', err);
    } finally {
      setCfLoading(false);
    }
  };

  useEffect(() => {
    loadProcurement();
    loadCollaborative();
  }, []);

  useEffect(() => {
    if (activeTab === 'procurement') {
      loadProcurement();
    }
  }, [statusFilter, activeTab]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.post('/ai/recommendations/generate');
      const count = res.data?.generated ?? 0;
      if (count === 0) {
        setSuccessMsg('Inventory scan complete — Stock levels are healthy across all branches.');
      } else {
        setSuccessMsg(`AI engine generated ${count} procurement recommendation${count !== 1 ? 's' : ''}.`);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.4 } });
      }
      loadProcurement();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to trigger recommendation scan');
    } finally {
      setGenerating(false);
    }
  };

  const approve = async (id: string) => {
    try {
      await api.patch(`/ai/recommendations/${id}/approve`);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } });
      loadProcurement();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Approval failed');
    }
  };

  const reject = async (id: string) => {
    try {
      await api.patch(`/ai/recommendations/${id}/reject`);
      loadProcurement();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Rejection failed');
    }
  };

  const activeCustomerGroup = cfData?.customerRecommendations?.[selectedCustIdx] || null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
              <Sparkles className="w-5 h-5" />
            </span>
            AI Recommendations &amp; Collaborative Filtering
            <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Machine Learning v2.0
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Multi-modal recommendation engine powering both{' '}
            <strong className="text-slate-700">Customer Product Recommendations (Item-Based Collaborative Filtering)</strong> and{' '}
            <strong className="text-slate-700">Autonomous Procurement Action Queues</strong> with explainable confidence rationale.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/ai-assistants">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              All Assistants
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={activeTab === 'collaborative' ? loadCollaborative : generate}
            disabled={generating || cfLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 disabled:opacity-60 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating || cfLoading ? 'animate-spin' : ''}`} />
            <span>{generating || cfLoading ? 'Running Inference...' : 'Refresh ML Matrix'}</span>
          </motion.button>
        </div>
      </div>

      {/* ── Top Level Mode Selector Tabs ──────────────────── */}
      <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1 max-w-xl">
        <button
          onClick={() => setActiveTab('collaborative')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'collaborative'
              ? 'bg-white text-purple-950 shadow-md shadow-purple-900/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-purple-600" />
          <span>Product Recommendation (Collaborative Filtering)</span>
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'procurement'
              ? 'bg-white text-purple-950 shadow-md shadow-purple-900/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-indigo-600" />
          <span>Procurement &amp; Reorders ({recs.filter((r) => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 1: PRODUCT RECOMMENDATION (COLLABORATIVE FILTERING) */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'collaborative' && (
        <div className="space-y-6">
          {/* ML Matrix Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card rounded-2xl p-4 shadow-sm border border-purple-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Engine Architecture</span>
              <p className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Collaborative Filtering
              </p>
              <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">Cosine Similarity Matrix</span>
            </div>

            <div className="glass-card rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer Cohorts</span>
              <p className="text-lg font-black text-slate-900 mt-1 font-display">
                {cfData?.customerRecommendations?.length || 4} Profiles
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% History Profiled</span>
            </div>

            <div className="glass-card rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Catalog Interaction</span>
              <p className="text-lg font-black text-slate-900 mt-1 font-display">
                {cfData?.totalProductsCatalog || 6} SKUs Mapped
              </p>
              <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">High Co-Purchase Density</span>
            </div>

            <div className="glass-card rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sales Orders Analyzed</span>
              <p className="text-lg font-black text-slate-900 mt-1 font-display">
                {cfData?.totalOrdersAnalyzed || 4} Checkouts
              </p>
              <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">Cross-Sell Affinity Engine</span>
            </div>
          </div>

          {/* Customer Selector Bar */}
          <div className="glass-card rounded-2xl p-4 shadow-sm space-y-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Select Customer Account to View History &amp; Personalized Recommendations:
              </span>
              <span className="text-[11px] text-slate-400">
                Active: <strong className="text-slate-800">{activeCustomerGroup?.customer?.name || 'Customer'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {(cfData?.customerRecommendations || []).map((group, idx) => (
                <button
                  key={group.customer._id}
                  onClick={() => setSelectedCustIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    selectedCustIdx === idx
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{group.customer.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCustIdx === idx ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-600'}`}>
                    ₨ {(group.history.totalSpend || 0).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dual Column: History & Recommended Products */}
          {activeCustomerGroup && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT: Customer Purchase History Card (4 cols) */}
              <div className="lg:col-span-5 glass-card rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
                      {activeCustomerGroup.customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {activeCustomerGroup.customer.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {activeCustomerGroup.customer.email || activeCustomerGroup.customer.phone || 'Verified Account'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Active Buyer
                  </span>
                </div>

                {/* History Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total Lifetime Spend</span>
                    <p className="text-sm font-black text-slate-900 font-display">
                      ₨ {(activeCustomerGroup.history.totalSpend || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Orders Recorded</span>
                    <p className="text-sm font-black text-slate-900 font-display">
                      {activeCustomerGroup.history.totalOrders} Checkout(s)
                    </p>
                  </div>
                </div>

                {/* Favorite Categories */}
                {Object.keys(activeCustomerGroup.history.favoriteCategories || {}).length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Top Affinity Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(activeCustomerGroup.history.favoriteCategories).map(([cat, cnt]) => (
                        <span key={cat} className="text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                          {cat} ({cnt}x)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previously Purchased Products */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-purple-600" />
                      Customer Purchase History:
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {activeCustomerGroup.history.purchasedProducts.length} Items Bought
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {activeCustomerGroup.history.purchasedProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No previous purchase records found for this account.</p>
                    ) : (
                      activeCustomerGroup.history.purchasedProducts.map((p) => (
                        <div key={p.productId} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs transition">
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.sku || p.category} • {p.purchaseCount} order(s)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-800">
                              ₨ {(p.totalSpend || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {p.totalQuantity} units total
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Recommended Products via Collaborative Filtering (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                      Recommended Products for {activeCustomerGroup.customer.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated via Item-Based Collaborative Filtering &amp; Co-Purchase Likelihood
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                    {activeCustomerGroup.recommendations.length} Top Matches
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCustomerGroup.recommendations.map((rec, idx) => (
                    <motion.div
                      key={rec.product._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {Math.round(rec.confidenceScore * 100)}% Match
                          </span>
                          <span className="text-[11px] font-black text-emerald-600 font-mono">
                            {rec.potentialBasketUplift}
                          </span>
                        </div>

                        {/* Product Title */}
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            {rec.product.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            SKU: {rec.product.sku || 'N/A'} • {rec.product.category || 'General'}
                          </span>
                        </div>

                        {/* Rationale */}
                        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {rec.rationale}
                        </p>
                      </div>

                      {/* Bottom Price & Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Sell Price</span>
                          <span className="text-sm font-black text-slate-900 font-display">
                            ₨ {(rec.product.sellPrice || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Salam ${activeCustomerGroup.customer.name}! Based on your purchase history, we have reserved ${rec.product.name} at Rs ${rec.product.sellPrice || ''} for your store. Would you like to add it to your next order?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition"
                            title="Share offer via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
                              navigate('/orders');
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
                          >
                            <span>Add to Order</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 2: AUTONOMOUS ACTION QUEUE (PROCUREMENT & REORDERS) */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          {/* ── Lifecycle + Risk Tiers ────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lifecycle strip §7.1 */}
            <div className="glass-card rounded-2xl p-4 shadow-elevated">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Recommendation Lifecycle · §7.1
              </p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {LIFECYCLE_MINI.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={step.label}>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shrink-0 ${step.color} border-slate-200/60`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{step.label}</span>
                      </div>
                      {i < LIFECYCLE_MINI.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Risk tiers §7.2 */}
            <div className="glass-card rounded-2xl p-4 shadow-elevated">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" /> Autonomy Risk Tiers · §7.2
              </p>
              <div className="grid grid-cols-3 gap-2">
                {RISK_TIERS_MINI.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <div key={tier.level} className={`p-2 rounded-xl border text-center ${tier.color}`}>
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="text-xs font-black">{tier.level}</span>
                      </div>
                      <p className="text-[9px] opacity-80 leading-tight">{tier.autonomy}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback message banner */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 text-sm font-bold">×</button>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 text-sm font-bold">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? 'All History' : tab}
              </button>
            ))}
          </div>

          {/* Cards container */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-purple-600" />
              <p className="text-xs font-semibold">Querying recommendation queue…</p>
            </div>
          ) : recs.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Boxes className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No {statusFilter} proposals in the queue</p>
              <p className="text-xs max-w-sm mx-auto">
                Click &quot;Scan &amp; Generate Proposals&quot; above to trigger inference across inventory and demand signals.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recs.map((r) => {
                const badge = riskBadges[r.riskTier] || riskBadges.low;
                const Icon = badge.icon;
                const confidencePct = Math.round((r.confidenceScore || 0) * 100);

                return (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-5 shadow-elevated border border-slate-200/80 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                          {r.assistant} assistant
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          r.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Related Product</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                          <Boxes className="w-4 h-4 text-purple-600" />
                          {r.relatedProduct?.name || 'Inventory Scan'}
                          {r.relatedProduct?.sku && (
                            <span className="text-[10px] font-mono text-slate-500 font-normal">({r.relatedProduct.sku})</span>
                          )}
                        </p>
                      </div>

                      {r.relatedSupplier && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Recommended Supplier</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-indigo-600" />
                            {r.relatedSupplier.name}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explainable Rationale · §7.3</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{r.rationale}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500">Model Confidence</span>
                          <span className={`font-black ${confidencePct >= 80 ? 'text-emerald-600' : confidencePct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {confidencePct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidencePct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              confidencePct >= 80 ? 'bg-emerald-500' : confidencePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>
                      {r.payload.estimatedCost !== undefined && (
                        <div className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">Estimated Reorder Cost</span>
                          <span className="text-sm font-black text-slate-900 font-display">
                            ${r.payload.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {r.status === 'pending' && (
                      <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => approve(r._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve → Auto-Create Purchase Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => reject(r._id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4 text-slate-500" />
                          <span>Reject &amp; Log</span>
                        </motion.button>
                        <p className="text-[10px] text-slate-400 ml-auto">Feedback logged for model refinement · §7.1</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </motion.div>
  );
};

export default Recommendations;
