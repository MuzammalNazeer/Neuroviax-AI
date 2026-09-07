import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  MessageCircle,
  DollarSign,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Zap,
  Activity,
  RefreshCw,
  CheckCircle2,
  Users,
  Truck,
  FileText,
} from 'lucide-react';

// Section 7 — AI Assistants
const ASSISTANTS = [
  {
    id: 'sales',
    name: 'Sales Assistant',
    icon: TrendingUp,
    domain: 'Orders · Customers · Products',
    output: ['Revenue forecasts by SKU & branch', 'Customer segmentation signals', 'Next-best-offer recommendations', 'Churn risk flags'],
    autonomy: 'medium',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    pillBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    phase: 4,
    relatedData: [{ icon: FileText, label: 'Orders' }, { icon: Users, label: 'Customers' }, { icon: Package, label: 'Products' }],
  },
  {
    id: 'procurement',
    name: 'Procurement Assistant',
    icon: ShoppingCart,
    domain: 'Suppliers · Purchase Orders · Inventory',
    output: ['Reorder quantity suggestions with rationale', 'Supplier price comparison & trend analysis', 'Lead-time risk flags', 'Auto-generated purchase order drafts'],
    autonomy: 'high',
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    pillBg: 'bg-blue-50 text-blue-700 border-blue-200',
    phase: 3,
    launch: true,
    relatedData: [{ icon: Truck, label: 'Suppliers' }, { icon: ShoppingCart, label: 'Purchase Orders' }, { icon: Package, label: 'Inventory' }],
  },
  {
    id: 'inventory',
    name: 'Inventory Assistant',
    icon: Package,
    domain: 'Inventory · Batches · Warehouses',
    output: ['Low-stock alerts adjusted by forecasted demand', 'Shrinkage & anomaly detection', 'Multi-location stock rebalancing suggestions', 'Barcode & batch tracking intelligence'],
    autonomy: 'low',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    pillBg: 'bg-amber-50 text-amber-700 border-amber-200',
    phase: 1,
    relatedData: [{ icon: Package, label: 'Inventory' }, { icon: Activity, label: 'Batches' }, { icon: FileText, label: 'Warehouses' }],
  },
  {
    id: 'marketing',
    name: 'Marketing Assistant',
    icon: BarChart3,
    domain: 'Customers · Campaigns · Loyalty',
    output: ['Segment-targeted promotion drafts', 'Loyalty-offer suggestions based on purchase history', 'Campaign ROI predictions', 'WhatsApp message automation'],
    autonomy: 'medium',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    pillBg: 'bg-pink-50 text-pink-700 border-pink-200',
    phase: 4,
    relatedData: [{ icon: Users, label: 'Customers' }, { icon: Activity, label: 'Campaigns' }, { icon: CheckCircle2, label: 'Loyalty' }],
  },
  {
    id: 'customer-support',
    name: 'Customer Support Assistant',
    icon: MessageCircle,
    domain: 'Conversations · FAQs · Orders',
    output: ['WhatsApp & email reply drafts', 'Escalation flags for complex issues', 'FAQ deflection automation', 'Order-status lookup responses'],
    autonomy: 'medium',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    pillBg: 'bg-violet-50 text-violet-700 border-violet-200',
    phase: 4,
    relatedData: [{ icon: MessageCircle, label: 'Conversations' }, { icon: FileText, label: 'FAQs' }, { icon: ShoppingCart, label: 'Orders' }],
  },
  {
    id: 'finance',
    name: 'Finance Assistant',
    icon: DollarSign,
    domain: 'Payments · Expenses · Invoices',
    output: ['14-day cash-flow forecast', 'Expense auto-categorization', 'Overdue invoice alerts & chase drafts', 'Receivables vs payables reconciliation'],
    autonomy: 'high',
    gradient: 'from-teal-500 to-cyan-500',
    bg: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    pillBg: 'bg-teal-50 text-teal-700 border-teal-200',
    phase: 4,
    relatedData: [{ icon: DollarSign, label: 'Payments' }, { icon: FileText, label: 'Expenses' }, { icon: Activity, label: 'Invoices' }],
  },
];

// Section 7.2 — Risk-Tiered Approval
const RISK_TIERS = [
  {
    level: 'low',
    label: 'Low Risk / Reversible',
    icon: ShieldCheck,
    example: 'Draft a reorder suggestion, flag low stock',
    autonomy: 'Fully autonomous — notify only',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    level: 'medium',
    label: 'Medium Risk / Bounded',
    icon: AlertTriangle,
    example: 'Auto-send a payment reminder, apply a pre-approved discount tier',
    autonomy: 'Autonomous within configured limits',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    level: 'high',
    label: 'High Risk / Financial or Legal',
    icon: ShieldAlert,
    example: 'Place a purchase order above threshold, issue a refund',
    autonomy: 'Requires explicit human approval',
    color: 'bg-rose-50 border-rose-200 text-rose-800',
    iconColor: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
  },
];

// Section 7.1 — Recommendation Lifecycle
const LIFECYCLE = [
  { step: 1, label: 'Signal Ingestion', desc: 'Stock change, sale, payment received captured in near-real time', icon: Zap, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { step: 2, label: 'Contextual Analysis', desc: 'Assistant evaluates signal against historical data & business rules', icon: Activity, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { step: 3, label: 'Recommendation Generation', desc: 'Structured proposal written with confidence score & risk tier', icon: Sparkles, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { step: 4, label: 'Routing', desc: 'Low-risk: auto-actioned. Medium/High: routed to human approver', icon: ArrowRight, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { step: 5, label: 'Feedback Capture', desc: 'Accepted / edited / rejected outcomes logged & used to refine future scoring', icon: RefreshCw, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const autonomyLabels: Record<string, string> = {
  low: 'Auto-executed',
  medium: 'Bounded auto',
  high: 'Human approval required',
};
const autonomyColors: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};

const AIAssistants: React.FC = () => {
  const [activeAssistant, setActiveAssistant] = useState<string | null>(null);
  const selected = ASSISTANTS.find((a) => a.id === activeAssistant) || null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-700" />
            </span>
            AI Intelligence Layer
            <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              6 Assistants
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Six specialized, domain-scoped AI assistants — each operating over a constrained data domain for accuracy,
            auditability, and granular permissioning. Every recommendation is risk-tiered and explainable.{' '}
            <span className="text-purple-600 font-semibold">§7 of the v5.0 Product Document.</span>
          </p>
        </div>
        <Link to="/recommendations">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Active Proposals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </Link>
      </div>

      {/* ── Recommendation Lifecycle (§7.1) ──────────────── */}
      <div className="glass-card rounded-2xl p-5 shadow-elevated">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black font-display text-slate-900 text-sm">Recommendation Lifecycle</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">How every AI recommendation flows from signal to outcome · §7.1</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 overflow-x-auto pb-1">
          {LIFECYCLE.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.step}>
                <div className={`flex-shrink-0 rounded-xl border p-3.5 min-w-[160px] ${step.color}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-white/70 flex items-center justify-center text-[10px] font-black">
                      {step.step}
                    </div>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-black">{step.label}</p>
                  <p className="text-[10px] leading-relaxed mt-0.5 opacity-80">{step.desc}</p>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 rotate-0 sm:rotate-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── 6 Assistant Cards ─────────────────────────────── */}
      <div>
        <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
          <span>All Assistants</span>
          <span className="text-[10px] text-slate-400 font-medium">— Click any card to expand</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASSISTANTS.map((a) => {
            const Icon = a.icon;
            const isExpanded = activeAssistant === a.id;
            return (
              <motion.div
                key={a.id}
                layout
                whileHover={{ y: -3 }}
                onClick={() => setActiveAssistant(isExpanded ? null : a.id)}
                className={`glass-card rounded-2xl border cursor-pointer overflow-hidden transition-all ${a.border} ${isExpanded ? 'shadow-elevated-hover' : 'shadow-elevated'}`}
              >
                {/* Card header — always visible */}
                <div className={`bg-gradient-to-br ${a.bg} p-4 border-b ${a.border}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-5 h-5 ${a.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{a.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.domain}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${autonomyColors[a.autonomy]}`}>
                        {autonomyLabels[a.autonomy]}
                      </span>
                      {a.launch && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          Phase {a.phase} Launch 🚀
                        </span>
                      )}
                      {!a.launch && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          Phase {a.phase}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Data domain chips */}
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {a.relatedData.map((d) => {
                      const DIcon = d.icon;
                      return (
                        <span key={d.label} className="inline-flex items-center gap-1 bg-white/70 border border-white/80 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          <DIcon className="w-2.5 h-2.5" />
                          {d.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Representative outputs — preview */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Representative Outputs</p>
                  <ul className="space-y-1">
                    {a.output.slice(0, isExpanded ? undefined : 2).map((o) => (
                      <li key={o} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${a.iconColor}`} />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                  {!isExpanded && a.output.length > 2 && (
                    <p className="text-[10px] text-slate-400 font-medium pl-5">+{a.output.length - 2} more outputs…</p>
                  )}
                </div>

                <div className={`px-4 pb-3 flex items-center justify-between text-[10px] text-slate-400`}>
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    Domain-scoped · Explainable
                  </span>
                  <span className="text-purple-500 font-bold flex items-center gap-0.5">
                    {isExpanded ? 'Collapse' : 'Expand'}
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Risk-Tiered Autonomy Model (§7.2) ────────────── */}
      <div className="glass-card rounded-2xl p-5 shadow-elevated">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black font-display text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Risk-Tiered Autonomy Model
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Every AI action is classified before execution — humans stay in the loop for consequential actions · §7.2</p>
          </div>
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full">§7.2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RISK_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.level} className={`rounded-xl border p-4 ${tier.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${tier.iconColor}`} />
                  <span className="text-xs font-black">{tier.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed mb-2 opacity-80">
                  <span className="font-semibold">Example:</span> {tier.example}
                </p>
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${tier.badge}`}>
                  <Zap className="w-3 h-3" />
                  {tier.autonomy}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
          <span className="font-black text-slate-800">Explainability Guarantee: </span>
          Every AI recommendation surfaces its rationale — e.g., <em>"reorder suggested because 14-day demand trend exceeds current stock coverage by 40%"</em> — so business owners build trust before granting greater autonomy.
        </div>
      </div>

      {/* ── CTA to Procurement Recommendations ───────────── */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 shadow-xl"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-black font-display text-base">Procurement Assistant is Live in Phase 3</h3>
            <p className="text-purple-200/70 text-xs mt-1 max-w-lg leading-relaxed">
              The AI Procurement Assistant — the first fully-specified assistant with the clearest ROI story — is generating reorder proposals right now.
              Review pending recommendations and apply human-in-the-loop approval.
            </p>
          </div>
          <Link to="/recommendations" className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white hover:bg-purple-50 text-purple-900 font-black px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Review AI Proposals
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAssistants;
