import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get('/ai/recommendations', { params: statusFilter === 'all' ? {} : { status: statusFilter } })
      .then((r) => setRecs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

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
      load();
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
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Approval failed');
    }
  };

  const reject = async (id: string) => {
    try {
      await api.patch(`/ai/recommendations/${id}/reject`);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Rejection failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-700" />
            </span>
            AI Procurement Assistant
            <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Phase 3 — Intelligence
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Autonomous reorder proposals with risk-tiering, confidence scoring, and{' '}
            <span className="font-semibold text-purple-700">Human-in-the-Loop approval gates</span>.
            Every recommendation is explainable — rationale, risk tier, and confidence score shown upfront. §7.1–7.3
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
            onClick={generate}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 disabled:opacity-60 transition-all flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{generating ? 'Running Inference Scan…' : 'Scan & Generate Proposals'}</span>
          </motion.button>
        </div>
      </div>

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
                  <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 ${step.color} shrink-0 border border-current/10`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-[11px] font-bold">{step.label}</span>
                  </div>
                  {i < LIFECYCLE_MINI.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Risk Tier summary §7.2 */}
        <div className="glass-card rounded-2xl p-4 shadow-elevated">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Risk-Tiered Autonomy Model · §7.2
          </p>
          <div className="space-y-1.5">
            {RISK_TIERS_MINI.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.level} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${t.color}`}>
                  <span className="flex items-center gap-2 text-[11px] font-bold">
                    <Icon className="w-3.5 h-3.5" />
                    {t.level} Risk — {t.example}
                  </span>
                  <span className="text-[10px] font-black opacity-70 shrink-0 ml-2">{t.autonomy}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Status Messages ───────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl p-3.5 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {['pending', 'approved', 'rejected', 'all'].map((s) => {
          const isActive = statusFilter === s;
          return (
            <motion.button
              key={s}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-bold px-4 py-2 rounded-xl capitalize transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
              }`}
            >
              {s} Proposals
            </motion.button>
          );
        })}
      </div>

      {/* ── Loading ───────────────────────────────────────── */}
      {loading && (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-xs">
          <div className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
            <span>Querying recommendation queue…</span>
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────── */}
      {!loading && recs.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3 border border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <p className="font-bold text-slate-700 text-sm">No proposals in this view</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Click "Scan & Generate Proposals" to analyze demand velocity and low-stock items.
            The Procurement Assistant will generate risk-tiered proposals with explainable rationale.
          </p>
        </div>
      )}

      {/* ── Recommendation Cards ──────────────────────────── */}
      <div className="space-y-4">
        {recs.map((r, idx) => {
          const risk = riskBadges[r.riskTier] || riskBadges.low;
          const RiskIcon = risk.icon;
          const confidencePct = Math.round(r.confidenceScore * 100);

          return (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className="glass-card rounded-2xl p-6 shadow-elevated border border-slate-200/80 space-y-4"
            >
              {/* Card Top */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {r.assistant} Assistant
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Action: {r.action}</span>
                  </div>
                  <h3 className="font-black text-slate-900 font-display text-base flex items-center gap-2 flex-wrap">
                    <Boxes className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reorder {r.payload.suggestedQuantity ?? 1} × {r.relatedProduct?.name || 'Catalog Item'}</span>
                    {r.relatedSupplier && (
                      <span className="text-slate-500 font-normal text-xs flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        from {r.relatedSupplier.name}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 border text-xs font-bold px-3 py-1 rounded-full ${risk.bg}`}>
                    <RiskIcon className="w-3.5 h-3.5" />
                    {risk.label}
                  </span>
                  <span className="capitalize bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Explainable Rationale — §7.3 */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                  Automated Rationale (§7.3 Explainability)
                </p>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">"{r.rationale}"</p>
              </div>

              {/* Confidence & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Confidence Score</span>
                    <span className={`font-black ${confidencePct >= 80 ? 'text-emerald-700' : confidencePct >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
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

              {/* Human-in-the-Loop Actions */}
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
                    <span>Reject & Log</span>
                  </motion.button>
                  <p className="text-[10px] text-slate-400 ml-auto">Feedback logged for model refinement · §7.1</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Recommendations;
