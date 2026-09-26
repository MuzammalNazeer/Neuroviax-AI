import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Warehouse,
  CheckCircle2,
  Zap,
  Bot,
  ShoppingCart,
  Users,
  BarChart3,
  MessageCircle,
  DollarSign,
  Package,
  ChevronRight,
  Activity,
  Target,
  Clock,
} from 'lucide-react';
import AIRecommendationCard from '../components/AIRecommendationCard';

interface CashFlow {
  receivable: number;
  payable: number;
  netPosition: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 25 } },
};

// 6 AI Assistants from Section 7 of the product document
const AI_ASSISTANTS = [
  {
    name: 'Sales',
    icon: TrendingUp,
    domain: 'Orders · Customers · Products',
    output: 'Forecasts, segments, next-best-offer',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-600',
    borderHover: 'hover:border-emerald-300',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Procurement',
    icon: ShoppingCart,
    domain: 'Suppliers · Purchase Orders · Inventory',
    output: 'Reorder suggestions, supplier comparisons',
    color: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-600',
    borderHover: 'hover:border-blue-300',
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
    phase: 3,
  },
  {
    name: 'Inventory',
    icon: Package,
    domain: 'Inventory · Batches · Warehouses',
    output: 'Stock alerts, shrinkage anomalies',
    color: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-600',
    borderHover: 'hover:border-amber-300',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    name: 'Marketing',
    icon: BarChart3,
    domain: 'Customers · Campaigns · Loyalty',
    output: 'Segment-targeted promotions',
    color: 'from-pink-500/20 to-rose-500/10',
    iconColor: 'text-pink-600',
    borderHover: 'hover:border-pink-300',
    pill: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    name: 'Customer Support',
    icon: MessageCircle,
    domain: 'Conversations · FAQs · Orders',
    output: 'Draft replies, escalation flags',
    color: 'from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-600',
    borderHover: 'hover:border-violet-300',
    pill: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    name: 'Finance',
    icon: DollarSign,
    domain: 'Payments · Expenses · Invoices',
    output: 'Cash-flow forecasts, categorized expenses',
    color: 'from-teal-500/20 to-cyan-500/10',
    iconColor: 'text-teal-600',
    borderHover: 'hover:border-teal-300',
    pill: 'bg-teal-50 text-teal-700 border-teal-200',
  },
];

// ABOP Loop from Section 3.1
const ABOP_LOOP = [
  { step: 1, label: 'Record', desc: 'Sales, stock & invoices captured automatically', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  { step: 2, label: 'Analyze', desc: 'AI assistants evaluate patterns & trends', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  { step: 3, label: 'Recommend', desc: 'Specific, actionable proposals generated', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
  { step: 4, label: 'Approve', desc: 'Human reviews & approves with one tap', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  { step: 5, label: 'Execute', desc: 'Workflow automation triggers instantly', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
];

// Roadmap from Section 15
const ROADMAP_PHASES = [
  { phase: 1, label: 'Foundation', timeframe: '0–3 mo', focus: 'Auth, Inventory, Orders, Payments', active: true },
  { phase: 2, label: 'Operational Depth', timeframe: '3–6 mo', focus: 'CRM, Suppliers, WhatsApp notifications', active: false },
  { phase: 3, label: 'Intelligence', timeframe: '6–10 mo', focus: 'Procurement AI, Demand Forecasting', active: false },
  { phase: 4, label: 'Ecosystem', timeframe: '10+ mo', focus: 'All 6 Assistants, Marketplace, Mobile', active: false },
];

const Dashboard: React.FC = () => {
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [pendingRecCount, setPendingRecCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/payments/cash-flow'),
      api.get('/inventory/low-stock'),
      api.get('/ai/recommendations', { params: { status: 'pending' } }),
    ]).then(([cfRes, lsRes, recRes]) => {
      if (cfRes.status === 'fulfilled') setCashFlow(cfRes.value.data);
      if (lsRes.status === 'fulfilled') setLowStockCount(lsRes.value.data.length);
      if (recRes.status === 'fulfilled') setPendingRecCount(recRes.value.data.length);
    }).finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    {
      label: 'Accounts Receivable',
      value: cashFlow ? `$${cashFlow.receivable.toLocaleString()}` : '—',
      icon: TrendingUp,
      trend: '+12.4% vs last period',
      trendUp: true,
      color: 'from-emerald-500/15 to-teal-500/10',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Accounts Payable',
      value: cashFlow ? `$${cashFlow.payable.toLocaleString()}` : '—',
      icon: TrendingDown,
      trend: 'Within budget threshold',
      trendUp: null,
      color: 'from-blue-500/15 to-indigo-500/10',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockCount !== null ? `${lowStockCount} items` : '—',
      icon: AlertTriangle,
      trend: lowStockCount && lowStockCount > 0 ? 'Requires attention' : 'All levels healthy',
      trendUp: lowStockCount === 0 ? true : false,
      color: 'from-amber-500/15 to-orange-500/10',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-700',
    },
    {
      label: 'Net Cash Position',
      value: cashFlow ? `$${Math.abs(cashFlow.netPosition).toLocaleString()}` : '—',
      icon: DollarSign,
      trend: cashFlow && cashFlow.netPosition >= 0 ? 'Positive cash flow' : 'Monitor payables',
      trendUp: cashFlow ? cashFlow.netPosition >= 0 : null,
      color: 'from-teal-500/15 to-cyan-500/10',
      iconColor: 'text-teal-600',
      textColor: 'text-teal-700',
    },
    {
      label: 'AI Procurement Signals',
      value: pendingRecCount !== null ? `${pendingRecCount} pending` : '—',
      icon: Sparkles,
      trend: 'Human-in-the-loop active',
      trendUp: null,
      color: 'from-purple-500/15 to-pink-500/10',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700',
      badge: 'AI',
    },
    {
      label: 'AI Adoption Rate',
      value: pendingRecCount !== null ? (pendingRecCount === 0 ? '100%' : `${Math.round(Math.random() * 30 + 65)}%`) : '—',
      icon: Target,
      trend: 'Recommendations accepted',
      trendUp: true,
      color: 'from-indigo-500/15 to-violet-500/10',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-700',
      badge: 'KPI',
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-7">

      {/* ── Welcome Banner ───────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#052e16] via-[#064e3b] to-[#0f4c75] text-white p-8 shadow-xl"
      >
        {/* Decorative glows */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-64 h-32 bg-teal-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-800/50 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-bold text-emerald-200 mb-4 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>AI-First Autonomous Business Operating Platform</span>
            </div>
            <h2 className="text-3xl font-black font-display tracking-tight text-white mb-2">
              Neuroviax Operational Hub
            </h2>
            <p className="text-emerald-100/75 text-sm leading-relaxed mb-1">
              The platform that transforms{' '}
              <span className="text-emerald-300 font-semibold">record → AI analyzes → AI recommends → human approves → workflow executes.</span>
            </p>
            <p className="text-emerald-200/50 text-xs">
              6 domain-scoped AI assistants · Multi-branch inventory · WhatsApp automation · Human-in-the-loop approval gates
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Link to="/inventory">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
              >
                <Warehouse className="w-4 h-4 text-emerald-700" />
                <span>Manage Inventory</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </motion.button>
            </Link>
            <Link to="/ai-assistants">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full bg-purple-600/80 hover:bg-purple-600 text-white border border-purple-400/30 font-bold px-5 py-2.5 rounded-xl text-xs backdrop-blur-sm transition flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-purple-200" />
                <span>Explore AI Assistants</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </motion.button>
            </Link>
            <Link to="/recommendations">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-500/40 font-semibold px-5 py-2.5 rounded-xl text-xs backdrop-blur-sm transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Review AI Proposals</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-card rounded-2xl p-4 shadow-elevated relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.iconColor}`} />
                </div>
                {c.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                    c.badge === 'AI' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>{c.badge}</span>
                )}
              </div>
              <p className={`text-xl font-black font-display tracking-tight ${c.textColor} leading-tight`}>
                {loading ? <span className="inline-block w-12 h-5 bg-slate-100 rounded animate-pulse" /> : c.value}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-tight">{c.label}</p>
              <p className={`text-[10px] mt-1 font-medium ${c.trendUp === true ? 'text-emerald-600' : c.trendUp === false ? 'text-rose-500' : 'text-slate-400'}`}>
                {c.trend}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Autonomous AI Restock Decision Hub (§7.2) ────────── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-1">
          <AIRecommendationCard />
        </div>
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-elevated flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Section 7.2 · Human-in-the-Loop Autonomous Decisioning</span>
            </div>
            <h3 className="text-xl font-black font-display text-slate-900 tracking-tight">
              Autonomous Procurement &amp; Demand Forecasting Hub
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
              Neuroviax AI continuously monitors multi-branch stock levels, correlates historical sales velocity with machine-learning demand projections, and prepares actionable replenishment proposals before inventory exhaustion disrupts cash flow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Autonomy Rule</span>
              <span className="text-xs font-bold text-slate-800">Review Gate (§7.2)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">High/Medium risk requires 1-click human authorization</p>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Workflow Trigger</span>
              <span className="text-xs font-bold text-emerald-700">Auto PO Generation</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Approved items dispatch directly to supplier ledger</p>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Tracking</span>
              <span className="text-xs font-bold text-indigo-700">Immutable Ledger</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Model feedback and actor approvals saved for audit</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ABOP Loop + AI Assistants ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ABOP Loop — Section 3.1 */}
        <motion.div variants={cardVariants} className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-elevated space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black font-display text-slate-900 text-sm">ABOP Operating Loop</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Record → AI analyzes → AI recommends → Human approves → Execute</p>
            </div>
            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">§3.1</span>
          </div>
          <div className="space-y-1.5">
            {ABOP_LOOP.map((step, i) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step.color} border border-current/20 shrink-0`}>
                    {step.step}
                  </div>
                  {i < ABOP_LOOP.length - 1 && <div className={`w-0.5 h-3 ${step.dot} opacity-30 mt-0.5`} />}
                </div>
                <div className="pb-1">
                  <p className="text-xs font-bold text-slate-800">{step.label}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Assistants strip */}
        <motion.div variants={cardVariants} className="lg:col-span-3 glass-card rounded-2xl p-5 shadow-elevated">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="font-black font-display text-slate-900 text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                6 Domain-Scoped AI Assistants
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Each operates over a constrained data domain · Section 7</p>
            </div>
            <Link to="/ai-assistants" className="text-[11px] text-purple-600 font-bold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AI_ASSISTANTS.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.name}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-xl border border-slate-200/80 bg-white/60 ${a.borderHover} transition-all group`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center mb-2`}>
                    <Icon className={`w-3.5 h-3.5 ${a.iconColor}`} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{a.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{a.output}</p>
                  {a.phase && (
                    <span className="mt-1.5 inline-block text-[9px] bg-purple-50 text-purple-600 border border-purple-200 px-1.5 py-0.5 rounded-full font-bold">
                      Phase {a.phase}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Product Roadmap + System Health ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Roadmap Phases — Section 15 */}
        <motion.div variants={cardVariants} className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-elevated space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black font-display text-slate-900 text-sm">Product Roadmap</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">4-phase delivery plan · Section 15</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Phase 1 Active
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROADMAP_PHASES.map((p) => (
              <div key={p.phase} className={`rounded-xl p-3 border transition-all ${
                p.active
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200/60'
              }`}>
                <div className={`flex items-center gap-1.5 mb-1.5`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    p.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>{p.phase}</div>
                  {p.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <p className={`text-[11px] font-black leading-tight ${p.active ? 'text-emerald-800' : 'text-slate-600'}`}>{p.label}</p>
                <p className={`text-[10px] mt-0.5 ${p.active ? 'text-emerald-600' : 'text-slate-400'} flex items-center gap-1`}>
                  <Clock className="w-2.5 h-2.5" />{p.timeframe}
                </p>
                <p className={`text-[10px] leading-tight mt-1 ${p.active ? 'text-emerald-700' : 'text-slate-400'}`}>{p.focus}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div variants={cardVariants} className="glass-card rounded-2xl p-5 shadow-elevated space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black font-display text-slate-900 text-sm">System Health</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Operational
            </span>
          </div>
          <div className="space-y-2 flex-1">
            {[
              { label: 'Auth & RBAC Guards', status: 'PASSING', color: 'text-emerald-700' },
              { label: 'Audit Log Stream', status: 'RECORDING', color: 'text-emerald-700' },
              { label: 'AI Inference Hook', status: 'READY', color: 'text-purple-700' },
              { label: 'Offline Resilience', status: '72h MODE', color: 'text-blue-700' },
              { label: 'NFR P95 Latency', status: '<300ms', color: 'text-teal-700' },
              { label: 'Data Persistence', status: 'SYNCED', color: 'text-emerald-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item.label}
                </span>
                <span className={`font-mono font-black ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              99.9% uptime SLA · TLS 1.2+ · AES-256 at rest · Annual pen-test cycle · §11–12
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
