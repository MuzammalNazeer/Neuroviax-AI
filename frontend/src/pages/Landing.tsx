import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import {
  Sparkles,
  ArrowRight,
  Bot,
  Zap,
  ShieldCheck,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  MessageCircle,
  DollarSign,
  Building2,
  Globe,
  Smartphone,
  Activity,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Star,
  HelpCircle,
  Check,
  X,
  XCircle,
  AlertTriangle,
  Crown,
  Scale,
  Layers,
  Cpu,
  Database,
  Radio,
  Bell,
  MessageSquare,
} from 'lucide-react';

// ── Animation variants ────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 300, damping: 24 },
  }),
};

// ── 6 AI Assistants ───────────────────────────────────────
const ASSISTANTS = [
  { name: 'Sales', icon: TrendingUp, domain: 'Orders · Customers · Products', output: 'Demand forecasts, segment analysis, next-best-offer', color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-500/10 to-teal-500/5', pill: 'bg-emerald-900/40 text-emerald-300 border-emerald-600/40' },
  { name: 'Procurement', icon: ShoppingCart, domain: 'Suppliers · Purchase Orders · Inventory', output: 'Reorder suggestions, supplier comparisons, cost optimization', color: 'from-blue-500 to-indigo-500', bg: 'from-blue-500/10 to-indigo-500/5', pill: 'bg-blue-900/40 text-blue-300 border-blue-600/40', phase: 3 },
  { name: 'Inventory', icon: Package, domain: 'Inventory · Batches · Warehouses', output: 'Stock alerts, shrinkage anomalies, reorder timing', color: 'from-amber-500 to-orange-500', bg: 'from-amber-500/10 to-orange-500/5', pill: 'bg-amber-900/40 text-amber-300 border-amber-600/40' },
  { name: 'Marketing', icon: BarChart3, domain: 'Customers · Campaigns · Loyalty', output: 'Segment-targeted promotions, campaign ROI projections', color: 'from-pink-500 to-rose-500', bg: 'from-pink-500/10 to-rose-500/5', pill: 'bg-pink-900/40 text-pink-300 border-pink-600/40' },
  { name: 'Customer Support', icon: MessageCircle, domain: 'Conversations · FAQs · Orders', output: 'Draft replies, escalation flags, resolution suggestions', color: 'from-violet-500 to-purple-500', bg: 'from-violet-500/10 to-purple-500/5', pill: 'bg-violet-900/40 text-violet-300 border-violet-600/40' },
  { name: 'Finance', icon: DollarSign, domain: 'Payments · Expenses · Invoices', output: 'Cash-flow forecasts, categorized expenses, anomaly detection', color: 'from-teal-500 to-cyan-500', bg: 'from-teal-500/10 to-cyan-500/5', pill: 'bg-teal-900/40 text-teal-300 border-teal-600/40' },
];

// ── ABOP Loop ─────────────────────────────────────────────
const LOOP = [
  { step: 'Record', desc: 'Sales, stock & invoices captured automatically', color: 'bg-slate-700 text-slate-100' },
  { step: 'Analyze', desc: 'AI assistants evaluate patterns & trends', color: 'bg-blue-800 text-blue-100' },
  { step: 'Recommend', desc: 'Specific, actionable proposals generated', color: 'bg-purple-800 text-purple-100' },
  { step: 'Approve', desc: 'Human reviews & approves with one tap', color: 'bg-amber-800 text-amber-100' },
  { step: 'Execute', desc: 'Workflow automation triggers instantly', color: 'bg-emerald-800 text-emerald-100' },
];

// ── Roadmap ───────────────────────────────────────────────
const ROADMAP = [
  { phase: 1, label: 'Foundation', time: '0–3 mo', desc: 'Auth, Inventory, Orders, Payments', active: true },
  { phase: 2, label: 'Operational Depth', time: '3–6 mo', desc: 'CRM, Suppliers, WhatsApp Notifications', active: false },
  { phase: 3, label: 'Intelligence', time: '6–10 mo', desc: 'Procurement AI, Demand Forecasting', active: false },
  { phase: 4, label: 'Ecosystem', time: '10+ mo', desc: 'All 6 Assistants, Marketplace, Mobile', active: false },
];

// ── Features ──────────────────────────────────────────────
const FEATURES = [
  { icon: Building2, label: 'Multi-Branch', desc: 'Manage unlimited locations from a single hub' },
  { icon: Bot, label: 'AI Procurement', desc: 'Autonomous reorder proposals with human approval gates' },
  { icon: TrendingUp, label: 'Cash-Flow Forecasting', desc: 'AI-driven receivable and payable projections in PKR' },
  { icon: Smartphone, label: 'WhatsApp Automation', desc: 'Order confirmations, alerts, and customer touchpoints' },
  { icon: Globe, label: 'Emerging Markets', desc: 'Built for Pakistan, India & MENA business realities' },
  { icon: ShieldCheck, label: 'Human-in-the-Loop', desc: 'No AI action executes without human approval' },
];

// ── FAQ Items for Search Intent & Rich Snippets ───────────
const FAQ_ITEMS = [
  {
    q: 'What is an Autonomous Business Operating Platform (ABOP)?',
    a: 'An ABOP is an AI-first evolution of traditional ERP systems. Instead of merely recording transactions after they occur, an ABOP features specialized AI agents that proactively detect inventory shortages, predict cash flow shortages, draft supplier purchase orders, and recommend marketing actions with human approval.',
  },
  {
    q: 'How do the 6 AI assistants work together?',
    a: 'Neuroviax AI employs 6 specialized domain copilots: Sales, Procurement, Inventory, Marketing, Customer Support, and Finance. They operate on a shared real-time ledger so that when an order arrives, Inventory reserves stock, Procurement checks supplier lead times, and Finance updates cash forecasts automatically.',
  },
  {
    q: 'Is Neuroviax AI tailored for SMEs in Pakistan, India, and MENA?',
    a: 'Yes. Neuroviax is built from the ground up for emerging market realities: multi-currency transactions (PKR, INR, AED, USD), cash-on-delivery (COD) reconciliation, WhatsApp business communication, and low-latency cloud infrastructure.',
  },
  {
    q: 'What is the "Human-in-the-Loop" safeguard?',
    a: 'Safety and trust are paramount. Neuroviax AI does not blindly trigger financial movements. The AI models analyze and recommend; owners and managers retain full one-click approval authority before purchase orders or automated messages are dispatched.',
  },
  {
    q: 'Can I integrate WhatsApp Business with Neuroviax AI?',
    a: 'Yes. Neuroviax features native WhatsApp integration to send automated order confirmations, delivery tracking updates, and customer follow-ups directly from your dashboard.',
  },
  {
    q: 'Is there a free starter plan available?',
    a: 'Yes! SMEs can sign up for our Free Starter Tier, which gives full access to core inventory tracking, order management, payment monitoring, and AI assistant previews without requiring a credit card.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

// ── Competitive Comparison Data (Section 05 of Strategy Doc) ──
const COMPETITOR_COMPARISON = [
  {
    name: 'Tally (India / Pakistan)',
    type: 'Legacy Desktop Accounting',
    overlapPercent: '30%',
    overlapDesc: 'Only static accounting & manual inventory ledger',
    limits: '0% AI capability, high latency, offline data silos, zero automated recommendations',
    neuroviaxAdvantage: 'Continuous AI reorder proposals + native 1-tap WhatsApp workflows',
  },
  {
    name: 'Zoho One',
    type: 'Horizontal Enterprise Suite',
    overlapPercent: '25%',
    overlapDesc: 'Standard CRM, invoices & multi-app bloat',
    limits: 'AI is a bolted-on checkbox feature; not an autonomous closed-loop operating default',
    neuroviaxAdvantage: 'Domain-scoped AI copilots running autonomously on a synchronized ledger',
  },
  {
    name: 'Odoo',
    type: 'Modular Open-Source ERP',
    overlapPercent: '30%',
    overlapDesc: 'CRUD models for inventory, purchase & POS',
    limits: 'High setup friction, consultant dependency, expensive maintenance for non-tech owners',
    neuroviaxAdvantage: 'Zero-friction 3-minute onboarding tailored specifically for retail & wholesale SMEs',
  },
  {
    name: 'QuickBooks',
    type: 'Finance-Centric Tool',
    overlapPercent: '20%',
    overlapDesc: 'General ledger, bank reconciliation & invoices',
    limits: 'Finance-only silo; lacks multi-warehouse intelligence, procurement AI, or supplier benchmarking',
    neuroviaxAdvantage: 'Full operating scope spanning inventory, suppliers, cash flow, and WhatsApp touchpoints',
  },
  {
    name: 'WhatsApp + Excel',
    type: 'Informal Default Baseline',
    overlapPercent: '15%',
    overlapDesc: 'Ad-hoc chats and unformatted spreadsheets',
    limits: 'Massive shrinkage, frequent stockouts, high human error, zero cash-flow predictability',
    neuroviaxAdvantage: 'Replaces chaos with structured cloud database while preserving WhatsApp speed',
  },
];

// ── 4-Tier Business Model & Pricing (Section 15 of Strategy Doc) ──
const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'MICRO BUSINESS',
    pricePKR: '4,500',
    priceUSD: '16',
    desc: 'Single-location micro businesses replacing Excel with digital inventory & orders.',
    the30Percent: 'Core 30% System of Record: 250 SKUs, 500 orders/mo, invoices & ledger.',
    features: [
      'Core inventory tracking & barcode counts',
      'Unified sales & purchase order logging',
      'Customer & supplier directories',
      'Basic rule-based low stock alerts',
      'Audit logging & standard RBAC',
    ],
    popular: false,
    cta: 'Start Free Trial',
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'SCALING SME',
    pricePKR: '12,500',
    priceUSD: '45',
    desc: 'Multi-branch retail & distribution scaling with WhatsApp automation.',
    the30Percent: 'Expanded Record: Up to 5 branches, 2,500 SKUs, unlimited orders.',
    features: [
      'Everything in Starter',
      'Multi-branch warehouse transfers',
      'WhatsApp order & dispatch automation',
      'Procurement AI Assistant (Supplier comparison)',
      'Customer CRM & segmentation',
    ],
    popular: false,
    cta: 'Launch Growth Workspace',
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'MOST POPULAR · 100% ABOP',
    pricePKR: '28,000',
    priceUSD: '99',
    desc: 'Established SMEs deploying the complete 6-Assistant autonomous intelligence suite.',
    the30Percent: 'Full Enterprise Scope: Unlimited branches, unlimited SKUs, multi-role teams.',
    features: [
      'All 6 Domain-Scoped AI Assistants',
      'Predictive 30-Day Cash-Flow Forecasting',
      'Human-in-the-Loop Risk Gating (Low/Med/High)',
      'WhatsApp 1-tap approval triggers',
      'Shrinkage anomaly & demand surge detection',
    ],
    popular: true,
    cta: 'Deploy Full ABOP Suite',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'FRANCHISE & CUSTOM',
    pricePKR: 'Custom',
    priceUSD: 'Custom',
    desc: 'Large retail chains, franchise networks, and light manufacturers.',
    the30Percent: 'Custom Architecture: Multi-tenant, custom database residency, SLA.',
    features: [
      'Dedicated LLM instance & private fine-tuning',
      'Custom ERP/legacy data migration tooling',
      'Multi-organization franchise console',
      '99.9% Uptime SLA & 24/7 priority support',
      'Custom payment gateway & banking APIs',
    ],
    popular: false,
    cta: 'Contact Enterprise Team',
  },
];

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <SEO
        title="Neuroviax AI — AI-First Autonomous Business Operating Platform"
        description="Scale your business with Neuroviax AI, the leading Autonomous Business Operating Platform (ABOP). Automate inventory, orders, payments, procurement & CRM with 6 specialized AI assistants."
        canonical="https://neuroviax.ai/landing"
        structuredData={FAQ_SCHEMA}
      />

      {/* ── Ambient glows ─────────────────────────────────── */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Navbar ────────────────────────────────────────── */}
      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-bold text-emerald-200">AI-First Autonomous Business Operating Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-5xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight leading-[1.05] mb-6"
            >
              Your Business,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Autonomously
              </span>{' '}
              Operated
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-4"
            >
              Neuroviax ABOP closes the loop:{' '}
              <span className="text-emerald-300 font-semibold">
                Record → AI Analyzes → AI Recommends → Human Approves → Workflow Executes.
              </span>
            </motion.p>

            <motion.p
              custom={1.5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-slate-500 text-sm mb-10"
            >
              AI-First · SME-Focused · Built for Pakistan, India & MENA
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              {user ? (
                <>
                  <Link to="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Open Business Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <motion.div
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Launch Your ABOP Workspace
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Link>
                  <Link to="/login">
                    <motion.div
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm px-7 py-3.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      Sign In to Platform
                    </motion.div>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* ── ABOP Loop visual ──────────────────────────── */}
          <motion.div
            id="loop"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest mb-5">
              The ABOP Operating Loop · Section 3.1
            </p>
            <div className="flex items-stretch gap-0">
              {LOOP.map((step, i) => (
                <div key={step.step} className="flex items-center flex-1">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`flex-1 rounded-2xl p-4 text-center ${step.color} border border-white/10 shadow-lg`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-wider mb-1">{step.step}</div>
                    <div className="text-[10px] opacity-70 leading-tight hidden sm:block">{step.desc}</div>
                  </motion.div>
                  {i < LOOP.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Live Sample AI Recommendation (Section 01 of Strategy Doc) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-left bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Sample Autonomous Recommendation · §01
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                    CONFIDENCE 0.87
                  </span>
                  <span className="bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                    RISK: LOW
                  </span>
                  <span className="bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                    ROUTE: AUTO-NOTIFY
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed mb-3">
                “Reorder 40 units of SKU-1182 from Supplier B — 12% cheaper than Supplier A this month, and current stock covers only 6 more days.”
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  One-tap WhatsApp/in-app approval • Triggers PO workflow automation instantly
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-3 py-1 rounded-lg">
                  Human-in-the-Loop Safeguard Active
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 6 AI ASSISTANTS ───────────────────────────────── */}
      <section id="assistants" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
              <Bot className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-xs font-bold text-purple-200">6 Domain-Scoped AI Assistants · Section 7</span>
            </div>
            <h2 className="text-4xl font-black font-display tracking-tight text-white mb-3">
              One AI for Every Business Domain
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Each assistant operates over a constrained data domain — scoped, auditable, and always human-approved.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ASSISTANTS.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.name}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`bg-gradient-to-br ${a.bg} border border-slate-800/80 rounded-2xl p-6 group transition-all cursor-default`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {a.phase && (
                      <span className="text-[10px] font-bold bg-purple-800/50 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded-full">
                        Phase {a.phase}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white mb-1">{a.name} Assistant</h3>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{a.domain}</p>
                  <div className={`text-[11px] font-semibold border rounded-lg px-3 py-2 leading-relaxed ${a.pill}`}>
                    {a.output}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RECOMMENDED COMPLETE SYSTEM ARCHITECTURE ──────────── */}
      <section id="architecture" className="py-24 border-t border-slate-800/80 relative bg-slate-950/80 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4 shadow-lg shadow-emerald-950/50"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Recommended Complete Architecture</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white mb-4">
              Real-Time Distributed{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                System Architecture
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
              High-throughput bidirectional WebSockets, distributed Redis message streams, multi-tenant persistence, and an autonomous AI orchestrator dispatching to FCM and WhatsApp.
            </p>
          </div>

          {/* Interactive Architecture Flow Diagram */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Visual Pipeline */}
              <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                {/* 1. React Web */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                      WEB
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">React Web Client (Socket.IO)</div>
                      <div className="text-[10px] text-slate-400">Low-latency UI · POS Scanning · Real-time Carts</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded">Tier 1</span>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-slate-500 text-[10px]">
                  <span>↓ WebSocket Channel (Bidirectional) ↓</span>
                </div>

                {/* 2. Node.js Backend */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                      API
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Node.js Express + Socket.IO Server</div>
                      <div className="text-[10px] text-slate-400">JWT Gateway · RBAC Guard · In-Memory / Mongo Adapter</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">Tier 2</span>
                </div>

                {/* Branch out to MongoDB + Redis */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-white text-[11px]">MongoDB</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Multi-tenant document store</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-white text-[11px]">Redis Pub/Sub</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Streams & queue distribution</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-slate-500 text-[10px]">
                  <span>↓ Redis Event Stream Ingestion ↓</span>
                </div>

                {/* 3. Event System */}
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-white text-xs">Enterprise Event Bus</span>
                    </div>
                    <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">Tier 3</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['ORDER', 'STOCK', 'PAYMENT', 'AI', 'ALERT', 'CHAT'].map((t) => (
                      <span key={t} className="text-[9px] bg-slate-950 px-2 py-0.5 rounded text-amber-300 border border-amber-500/30">
                        {t}_EVENT
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-slate-500 text-[10px]">
                  <span>↓ Automated Inference Trigger ↓</span>
                </div>

                {/* 4. AI Orchestrator */}
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                      AI
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">AI Orchestrator (ML + LLM + RAG + Agents)</div>
                      <div className="text-[10px] text-slate-400">Isolation Forest · XGBoost · Cosine Similarity · 6 Copilots</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded">Tier 4</span>
                </div>

                {/* 5. Notification Service */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-white">FCM Push</div>
                      <div className="text-[9px] text-slate-400">Mobile & Web Alerts</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-white">WhatsApp</div>
                      <div className="text-[9px] text-slate-400">Customer Receipts & Approvals</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Key Capabilities & Deep Dive */}
              <div className="lg:col-span-5 bg-slate-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 font-mono">
                      Why This Architecture Matters
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Unlike standard CRUD applications that poll APIs or suffer from bottlenecked relational locks, this architecture decouples heavy computing via <strong>Redis pub/sub streams</strong> and asynchronously triggers our <strong>AI Orchestrator</strong>.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Sub-40ms Event Latency</h4>
                        <p className="text-[11px] text-slate-400">Immediate synchronization across distributed cash registers and branches.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Autonomous Agent Loop</h4>
                        <p className="text-[11px] text-slate-400">AI models compute reorders and fraud risk in background without blocking POS.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Omnichannel Dispatch</h4>
                        <p className="text-[11px] text-slate-400">FCM pushes urgent staff notifications; WhatsApp engages customers instantly.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/architecture"
                    className="w-full text-center py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Open Interactive Architecture Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── THE 30/70 DIFFERENTIATOR & COMPETITIVE MATRIX (§05) ── */}
      <section id="comparison" className="py-24 border-t border-slate-800/60 relative bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Competitive Landscape & Differentiation · Section 05</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white mb-4">
              The{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                30% vs 70%
              </span>{' '}
              Differentiator
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Why switch? Legacy software only covers 30%—passive bookkeeping. Neuroviax is an AI-native operating system delivering the remaining 70%—proactive reasoning and automated execution.
            </p>
          </div>

          {/* Contrast Cards: 30% Legacy vs 70% Neuroviax */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16 items-stretch">
            {/* The 30% Baseline */}
            <div className="md:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                    30% Max Overlap
                  </span>
                  <span className="text-xs text-slate-500">Traditional ERP Baseline</span>
                </div>
                <h3 className="text-xl font-black text-slate-300 mb-2">Passive Record-Keeping</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Tally, Zoho, Odoo, QuickBooks, and Excel merely record what already happened:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Post-Mortem Reports:</strong> Owner must personally spot stockouts or slow SKUs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Decision Latency:</strong> Reports reviewed weeks later; optimal buy window missed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Cash-Flow Blindness:</strong> No 30-day forward projection of payables vs receivables.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>AI Checkbox Add-on:</strong> Generic chatbot bolted onto a 15-year-old accounting database.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                Result: High mental fatigue, stockout losses, manual spreadsheet chaos.
              </div>
            </div>

            {/* The 70% Neuroviax Proprietary Layer */}
            <div className="md:col-span-7 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/50 rounded-3xl p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
                    70% Autonomous Intelligence
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">Neuroviax ABOP Exclusivity</span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">AI-First Autonomous Loop</h3>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  Data accrues naturally → AI analyzes → AI recommends → Human approves → Workflow executes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300">
                  <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>6 Scoped Domain Copilots</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Sales, Procurement, Inventory, Marketing, Support, Finance.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Risk-Tiered Autonomy</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Low, Medium, High risk gating with one-tap human sign-off.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Native Trigger</span>
                    </div>
                    <p className="text-[11px] text-slate-400">One-tap purchase approvals & customer alerts on mobile.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Proprietary Data Moat</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Learns your seasonal supplier cycles and cash conversion curves.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-900/60 text-[11px] text-emerald-300/80 font-mono relative z-10">
                Result: Zero stockouts, 12% lower input purchasing costs, owners regain 15+ hours/week.
              </div>
            </div>
          </div>

          {/* Detailed Competitor Breakdown Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-x-auto shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Competitor Benchmark Matrix</h3>
            <p className="text-xs text-slate-400 mb-6">How Neuroviax compares against incumbents in Pakistan, India & MENA</p>
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 pr-4">Competitor</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Feature Overlap</th>
                  <th className="pb-3 pr-4">Structural Bottleneck</th>
                  <th className="pb-3 text-emerald-400">Where Neuroviax Wins (70% Moat)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {COMPETITOR_COMPARISON.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-white">{c.name}</td>
                    <td className="py-3.5 pr-4 text-slate-400">{c.type}</td>
                    <td className="py-3.5 pr-4 font-mono font-bold text-amber-400">{c.overlapPercent}</td>
                    <td className="py-3.5 pr-4 text-slate-400 leading-relaxed">{c.limits}</td>
                    <td className="py-3.5 text-emerald-300 font-semibold leading-relaxed">{c.neuroviaxAdvantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black font-display tracking-tight text-white mb-3">
              Built for Real Business Realities
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Every feature is grounded in what South Asian and MENA SMEs actually face.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 group hover:border-emerald-600/40 hover:bg-slate-900 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-emerald-400 w-[18px] h-[18px]" />
                  </div>
                  <p className="text-sm font-black text-white mb-1">{f.label}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4-TIER BUSINESS MODEL & PRICING (§15) ──────────── */}
      <section id="pricing" className="py-24 border-t border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-emerald-300">Predictable Tiered Pricing · Section 15</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white mb-4">
              Transparent Plans for Every Growth Stage
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
              Benchmarked against regional realities. Start on our micro tier and scale into autonomous operating depth.
            </p>

            {/* Currency Toggle */}
            <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-lg">
              <button
                onClick={() => setCurrency('PKR')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currency === 'PKR' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                PKR (Rs)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currency === 'USD' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => {
              const price = currency === 'PKR' ? `Rs ${tier.pricePKR}` : `$${tier.priceUSD}`;
              return (
                <div
                  key={tier.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    tier.popular
                      ? 'bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10'
                      : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-black text-emerald-400 tracking-wider">
                        {tier.badge}
                      </span>
                      {tier.popular && (
                        <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed min-h-[36px]">{tier.desc}</p>
                    
                    <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-800">
                      <span className="text-3xl font-black text-white">{price}</span>
                      {tier.id !== 'enterprise' && <span className="text-xs text-slate-500 font-medium">/ month</span>}
                    </div>

                    <div className="mb-4 text-[11px] font-semibold text-emerald-300/90 bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-2.5">
                      {tier.the30Percent}
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/register">
                    <button
                      className={`w-full py-3 rounded-2xl text-xs font-black transition-all ${
                        tier.popular
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      {tier.cta}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ───────────────────────────────────────── */}
      <section id="roadmap" className="py-24 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs font-bold text-emerald-200">4-Phase Delivery Plan · Section 15</span>
            </div>
            <h2 className="text-4xl font-black font-display tracking-tight text-white mb-3">
              Product Roadmap
            </h2>
            <p className="text-slate-400 text-sm">Progressive AI capability delivery — Phase 1 is live today.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROADMAP.map((p, i) => (
              <motion.div
                key={p.phase}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-2xl p-5 border transition-all ${
                  p.active
                    ? 'bg-gradient-to-br from-emerald-900/60 to-teal-900/40 border-emerald-600/50 shadow-xl shadow-emerald-900/20'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    p.active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>{p.phase}</div>
                  {p.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <p className={`text-sm font-black mb-1 ${p.active ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {p.label}
                </p>
                <p className={`text-[11px] mb-2 font-mono ${p.active ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {p.time}
                </p>
                <p className={`text-[11px] leading-relaxed ${p.active ? 'text-emerald-300/80' : 'text-slate-500'}`}>
                  {p.desc}
                </p>
                {p.active && (
                  <span className="mt-3 inline-block text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    LIVE NOW
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST PILLARS ─────────────────────────────────── */}
      <section className="py-20 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Bot, label: 'AI-First', desc: 'Every insight is AI-generated. Every action is human-gated.', color: 'text-purple-400' },
              { icon: Building2, label: 'SME-Focused', desc: 'Designed for businesses with 5–500 employees, not enterprises.', color: 'text-emerald-400' },
              { icon: Globe, label: 'Emerging Markets', desc: 'Localized for Pakistan, India, and the broader MENA region.', color: 'text-teal-400' },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                    <Icon className={`w-6 h-6 ${p.color}`} />
                  </div>
                  <p className="text-base font-black text-white">{p.label}</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECURITY STRIP ────────────────────────────────── */}
      <section className="py-8 border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500 font-medium">
            {['JWT Authentication', 'RBAC Permissions', 'AES-256 at Rest', 'TLS 1.2+', '99.9% Uptime SLA', 'Audit Trail', 'Human-in-the-Loop'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION (SEO & Google Rich Snippets) ────── */}
      <section id="faq" className="py-24 border-t border-slate-800/60 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Frequently Asked Questions</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white mb-4">
              Everything You Need to Know About{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Neuroviax ABOP
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Answers to common questions about autonomous business operations, domain AI assistants, and regional emerging-market infrastructure.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-emerald-500/50 bg-slate-900/90 shadow-xl shadow-emerald-500/5'
                      : 'border-slate-800/70 bg-slate-900/30 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {item.q}
                    </h3>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-emerald-500 text-slate-950 rotate-180' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
};

export default Landing;
