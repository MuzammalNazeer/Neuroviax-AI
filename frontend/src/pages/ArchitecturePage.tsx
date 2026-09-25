import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import SEO from '../components/SEO';
import {
  Cpu,
  Server,
  Database,
  Radio,
  Zap,
  Bell,
  MessageSquare,
  Bot,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowDown,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  Smartphone,
  Check,
  Play,
  RotateCcw,
  Workflow,
  Activity,
  Network,
  Clock,
  Gauge,
  Sliders,
  Filter,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface SimulatedEvent {
  id: string;
  name: string;
  category: 'ORDER' | 'STOCK' | 'PAYMENT' | 'AI' | 'ALERT' | 'CHAT';
  sourceChannel: 'REST (Express)' | 'Socket.IO (Real-time)' | 'Webhooks (External APIs)';
  sourceChannelType: 'REST' | 'SOCKET' | 'WEBHOOK';
  redisChannel: 'Pub/Sub' | 'Streams' | 'Pub/Sub + Streams';
  queueName: string;
  payload: string;
  aiWorkerSubsystem: 'ML Models' | 'LLM Reasoning' | 'RAG Engine' | 'Ensemble AI';
  aiWorkerAction: string;
  notificationTarget: 'FCM (Mobile)' | 'WhatsApp (Customer)' | 'FCM + WhatsApp';
  fcmMessage: string;
  whatsappMessage: string;
  color: string;
}

const SIMULATED_EVENTS: SimulatedEvent[] = [
  {
    id: 'evt-1',
    name: 'POS Retail Checkout Completed',
    category: 'ORDER',
    sourceChannel: 'Socket.IO (Real-time)',
    sourceChannelType: 'SOCKET',
    redisChannel: 'Pub/Sub + Streams',
    queueName: 'orders-pos-queue',
    payload: 'Order #NX-9421 for ₨ 48,200 (Branch: DHA Lahore, 4 SKUs reserved)',
    aiWorkerSubsystem: 'ML Models',
    aiWorkerAction: 'Inventory Copilot computes post-sale velocity and updates live stock level',
    notificationTarget: 'FCM + WhatsApp',
    fcmMessage: '⚡ POS Cashier Alert: Order #NX-9421 paid via Cash (₨ 48,200)',
    whatsappMessage: '✅ Salam Bilal, your order #NX-9421 has been packed! E-Receipt: neuroviax.ai/r/9421',
    color: 'emerald',
  },
  {
    id: 'evt-2',
    name: 'Low Stock Safety Buffer Breached',
    category: 'STOCK',
    sourceChannel: 'REST (Express)',
    sourceChannelType: 'REST',
    redisChannel: 'Streams',
    queueName: 'procurement-eoq-queue',
    payload: 'SKU #SKU-994 (Organic Green Tea) dropped to 14 units (Safety buffer: 25)',
    aiWorkerSubsystem: 'ML Models',
    aiWorkerAction: 'Exponential Smoothing + Wilson EOQ computes optimal reorder batch size of 150 units',
    notificationTarget: 'FCM (Mobile)',
    fcmMessage: '⚠️ Stockout Alert: SKU-994 will exhaust in 2.3 days at current consumption rate',
    whatsappMessage: '📦 Supplier RFQ: Draft PO #PO-881 generated for Alpha Distributors approval.',
    color: 'amber',
  },
  {
    id: 'evt-3',
    name: 'Isolation Forest Anomaly Flagged',
    category: 'ALERT',
    sourceChannel: 'REST (Express)',
    sourceChannelType: 'REST',
    redisChannel: 'Streams',
    queueName: 'security-anomaly-queue',
    payload: 'Outlier payment ₨ 380,000 at 02:45 AM from untrusted subnet (iTree score: 0.89)',
    aiWorkerSubsystem: 'ML Models',
    aiWorkerAction: 'Isolation Forest (t=100) confirms circadian outlier and quarantines disbursement',
    notificationTarget: 'FCM + WhatsApp',
    fcmMessage: '🛡️ Fraud Shield: High-risk anomaly isolated! Review 1-click quarantine in Cockpit',
    whatsappMessage: '🚨 Security Alert: High-value transaction flagged. Reply "YES" to approve or "FREEZE".',
    color: 'rose',
  },
  {
    id: 'evt-4',
    name: 'Stripe SaaS Subscription Webhook',
    category: 'PAYMENT',
    sourceChannel: 'Webhooks (External APIs)',
    sourceChannelType: 'WEBHOOK',
    redisChannel: 'Streams',
    queueName: 'billing-webhook-queue',
    payload: 'Stripe event: checkout.session.completed (Professional ABOP Tier, ₨ 28,000/mo)',
    aiWorkerSubsystem: 'RAG Engine',
    aiWorkerAction: 'Synchronizes tenant entitlement matrix and unlocks 6 AI copilot worker pipelines',
    notificationTarget: 'FCM + WhatsApp',
    fcmMessage: '🎉 Plan Upgrade: Business upgraded to Professional ABOP tier!',
    whatsappMessage: '💎 Welcome to Neuroviax Professional! All 6 AI Assistants are now active.',
    color: 'cyan',
  },
  {
    id: 'evt-5',
    name: 'Copilot Liquidity Intelligence Query',
    category: 'CHAT',
    sourceChannel: 'Socket.IO (Real-time)',
    sourceChannelType: 'SOCKET',
    redisChannel: 'Pub/Sub',
    queueName: 'ai-copilot-interactive-queue',
    payload: 'Prompt: "What is our predicted cash-runway for the next 30 days factoring supplier dues?"',
    aiWorkerSubsystem: 'LLM Reasoning',
    aiWorkerAction: 'Blends XGBoost (45%) + LightGBM (35%) + RAG sales records into natural language summary',
    notificationTarget: 'FCM (Mobile)',
    fcmMessage: '💡 Copilot Ready: 30-Day projected net position is +₨ 1,240,000 (Runway: 84 days)',
    whatsappMessage: '📊 Neuroviax Copilot: Your executive cash flow breakdown report is ready to review.',
    color: 'purple',
  },
];

const EVENT_CATALOG = [
  {
    name: 'order.created',
    channel: 'REST / POS Socket',
    queue: 'orders-queue',
    worker: 'AI Worker (ML)',
    action: 'Deducts stock allocation, recalculates category velocity, triggers bundle recommender.',
    sla: '< 40ms',
    tag: 'ORDER',
  },
  {
    name: 'pos.checkout.completed',
    channel: 'Socket.IO',
    queue: 'orders-queue',
    worker: 'Notification (WhatsApp)',
    action: 'Dispatches customer e-receipt and logs cash reconciliation voucher.',
    sla: '< 150ms',
    tag: 'ORDER',
  },
  {
    name: 'stock.threshold.breached',
    channel: 'REST',
    queue: 'inventory-queue',
    worker: 'AI Worker (ML - EOQ)',
    action: 'Solves Economic Order Quantity (EOQ) formula and generates draft Purchase Order.',
    sla: '< 100ms',
    tag: 'STOCK',
  },
  {
    name: 'stock.shrinkage.flagged',
    channel: 'REST',
    queue: 'anomaly-queue',
    worker: 'AI Worker (Isolation Forest)',
    action: 'Detects phantom inventory variance between physical audits and ledger.',
    sla: '< 80ms',
    tag: 'STOCK',
  },
  {
    name: 'checkout.session.completed',
    channel: 'Webhooks (Stripe)',
    queue: 'billing-queue',
    worker: 'Notification (FCM)',
    action: 'Activates SaaS license, generates invoice PDF, pushes push notification.',
    sla: '< 200ms',
    tag: 'PAYMENT',
  },
  {
    name: 'payment.anomaly.flagged',
    channel: 'REST',
    queue: 'anomaly-queue',
    worker: 'AI Worker (Isolation Forest)',
    action: 'Computes anomaly score s(x, n) for off-hours circadian transactions.',
    sla: '< 50ms',
    tag: 'ALERT',
  },
  {
    name: 'ai.copilot.stream_token',
    channel: 'Socket.IO',
    queue: 'ai-interactive-queue',
    worker: 'AI Worker (LLM + RAG)',
    action: 'Streams LLM tokens directly to frontend chatboard over bidirectional WebSocket.',
    sla: '< 25ms',
    tag: 'CHAT',
  },
  {
    name: 'customer.rfm.recalculated',
    channel: 'Cron / BullMQ',
    queue: 'analytics-queue',
    worker: 'AI Worker (K-Means)',
    action: 'Clusters customers into Champions, Potential Loyalists, At Risk, and Lost cohorts.',
    sla: 'Batch',
    tag: 'AI',
  },
];

export const ArchitecturePage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<SimulatedEvent>(SIMULATED_EVENTS[0]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const runSimulation = (event: SimulatedEvent) => {
    setSelectedEvent(event);
    setActiveStep(1);
    setIsSimulating(true);

    const stepIntervals = [1, 2, 3, 4, 5];
    stepIntervals.forEach((step, idx) => {
      setTimeout(() => {
        setActiveStep(step);
        if (step === 5) {
          setIsSimulating(false);
        }
      }, (idx + 1) * 650);
    });
  };

  const filteredCatalog =
    filterCategory === 'ALL'
      ? EVENT_CATALOG
      : EVENT_CATALOG.filter((item) => item.tag === filterCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <SEO
        title="Event-Driven Distributed Architecture — Neuroviax AI"
        description="Explore the real-time event-driven architecture of Neuroviax AI: REST, Socket.IO, Webhooks, Redis Pub/Sub & Streams, BullMQ, AI Workers (ML, LLM, RAG), and Notification Services."
      />
      <LandingNavbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── HERO BANNER ────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-5 shadow-lg shadow-emerald-950/40"
          >
            <Network className="w-3.5 h-3.5 animate-pulse" />
            <span>High-Throughput Reactive Architecture</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-5 max-w-4xl mx-auto leading-tight"
          >
            Neuroviax AI <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Event-Driven Distributed Backbone
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed"
          >
            Decoupled, event-driven topology separating ingest ingestion (REST, Socket.IO, Webhooks) from 
            in-memory brokers (Redis Pub/Sub & Streams), distributed job queues (BullMQ), dual intelligence workers (ML, LLM, RAG), 
            and automated customer touchpoints (FCM, WhatsApp).
          </motion.p>
        </section>

        {/* ── MAIN INTERACTIVE ARCHITECTURE VISUALIZER ─────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Simulator Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                    Live Event Flow Simulator
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Signal Propagation Through The Stack
                </h2>
              </div>

              {/* Event Scenario Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                {SIMULATED_EVENTS.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => runSimulation(evt)}
                    disabled={isSimulating}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedEvent.id === evt.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                    } disabled:opacity-50`}
                  >
                    <Play className="w-3 h-3" />
                    <span>{evt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── THE EXACT ARCHITECTURE FLOWCHART DIAGRAM ───────── */}
            <div className="max-w-4xl mx-auto bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 relative">
              
              {/* STAGE 0: PLATFORM TOP */}
              <div className="flex justify-center mb-6">
                <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-800 to-cyan-500/20 border border-emerald-500/40 text-center shadow-lg">
                  <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-300">
                    ⚡ NEUROVIAX AI ECOSYSTEM
                  </span>
                </div>
              </div>

              {/* STAGE 1: INGESTION LAYER (REST / SOCKET.IO / WEBHOOKS) */}
              <div className="mb-6">
                <div className="text-center mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all ${
                    activeStep >= 1 ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300' : 'border-slate-800 bg-slate-900 text-slate-500'
                  }`}>
                    Stage 1: Multi-Channel Ingestion Gateways
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* REST -> Express */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    activeStep >= 1 && selectedEvent.sourceChannelType === 'REST'
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                      : 'border-slate-800/80 bg-slate-900/60'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-400 font-mono">REST</span>
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">Express API Gateway</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Sync CRUD, JWT auth, POS checkout & ledger modifications.
                    </p>
                    {activeStep >= 1 && selectedEvent.sourceChannelType === 'REST' && (
                      <div className="mt-2 text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3 animate-pulse" /> Active Ingest
                      </div>
                    )}
                  </div>

                  {/* Socket.IO -> Real-time */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    activeStep >= 1 && selectedEvent.sourceChannelType === 'SOCKET'
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30'
                      : 'border-slate-800/80 bg-slate-900/60'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-cyan-400 font-mono">Socket.IO</span>
                      <Radio className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">Real-time WebSocket</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Sub-40ms bi-directional events, scanner broadcasts & live copilot chat.
                    </p>
                    {activeStep >= 1 && selectedEvent.sourceChannelType === 'SOCKET' && (
                      <div className="mt-2 text-[10px] font-mono text-cyan-300 bg-cyan-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3 animate-pulse" /> Active Ingest
                      </div>
                    )}
                  </div>

                  {/* Webhooks -> External APIs */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    activeStep >= 1 && selectedEvent.sourceChannelType === 'WEBHOOK'
                      ? 'border-amber-500 bg-amber-950/40 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30'
                      : 'border-slate-800/80 bg-slate-900/60'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-400 font-mono">Webhooks</span>
                      <Workflow className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">External APIs</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Stripe subscription webhooks, JazzCash, Easypaisa & WhatsApp inbound.
                    </p>
                    {activeStep >= 1 && selectedEvent.sourceChannelType === 'WEBHOOK' && (
                      <div className="mt-2 text-[10px] font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3 animate-pulse" /> Active Ingest
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CONNECTOR ARROW 1 */}
              <div className="flex justify-center my-3">
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                  activeStep >= 2 ? 'border-red-500/70 bg-red-950/40 text-red-300 shadow-md shadow-red-500/10' : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}>
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Publishes To Redis Event Broker</span>
                </div>
              </div>

              {/* STAGE 2: REDIS (PUB/SUB + STREAMS) */}
              <div className="mb-6">
                <div className={`p-5 rounded-2xl border transition-all ${
                  activeStep >= 2
                    ? 'border-red-500 bg-red-950/20 shadow-xl shadow-red-500/10'
                    : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xs">
                        REDIS
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Redis In-Memory Data Store & Message Bus</h3>
                        <p className="text-[11px] text-slate-400">Microsecond event buffering preventing database write lockup</p>
                      </div>
                    </div>
                    {activeStep >= 2 && (
                      <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Routed
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Pub/Sub */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-red-400 font-mono">Pub / Sub</span>
                        <Radio className="w-3 h-3 text-red-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Ephemeral real-time message broadcasting across connected WebSocket clients and worker pods.
                      </p>
                    </div>

                    {/* Streams */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-rose-400 font-mono">Streams</span>
                        <Layers className="w-3 h-3 text-rose-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Durable, append-only log providing offset tracking, replay capabilities, and consumer groups.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONNECTOR ARROW 2 */}
              <div className="flex justify-center my-3">
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                  activeStep >= 3 ? 'border-amber-500/70 bg-amber-950/40 text-amber-300 shadow-md shadow-amber-500/10' : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}>
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Enqueued Into BullMQ Queue</span>
                </div>
              </div>

              {/* STAGE 3: BULLMQ */}
              <div className="mb-6">
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 3
                    ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                        QUEUE
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">BullMQ Job Queue Engine</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-300 font-mono">
                            Priority & Backpressure Manager
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Manages job retries, concurrency limits, delayed jobs, and assigns payloads to specialized worker pools.
                        </p>
                      </div>
                    </div>
                    {activeStep >= 3 && (
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-800/60">
                        Queue: {selectedEvent.queueName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CONNECTOR ARROW 3 */}
              <div className="flex justify-center my-3">
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                  activeStep >= 4 ? 'border-purple-500/70 bg-purple-950/40 text-purple-300 shadow-md shadow-purple-500/10' : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}>
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Dispatched To Target Workers</span>
                </div>
              </div>

              {/* STAGE 4: DUAL WORKERS (AI WORKER + NOTIFICATION WORKER) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                
                {/* AI Worker */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  activeStep >= 4
                    ? 'border-purple-500 bg-purple-950/20 shadow-xl shadow-purple-500/10'
                    : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">AI Worker Suite</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 font-mono">
                      Decisions & ML
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Executes statistical algorithms, anomaly evaluations, vector embeddings, and LLM reasoning.
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <div className={`p-2 rounded-lg text-center border ${
                      selectedEvent.aiWorkerSubsystem === 'ML Models' && activeStep >= 4
                        ? 'border-purple-400 bg-purple-900/50 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}>
                      <div className="text-[11px] font-bold">ML</div>
                      <div className="text-[9px] font-mono text-purple-300">iForest/EOQ</div>
                    </div>
                    <div className={`p-2 rounded-lg text-center border ${
                      selectedEvent.aiWorkerSubsystem === 'LLM Reasoning' && activeStep >= 4
                        ? 'border-purple-400 bg-purple-900/50 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}>
                      <div className="text-[11px] font-bold">LLM</div>
                      <div className="text-[9px] font-mono text-purple-300">Copilot Chat</div>
                    </div>
                    <div className={`p-2 rounded-lg text-center border ${
                      selectedEvent.aiWorkerSubsystem === 'RAG Engine' && activeStep >= 4
                        ? 'border-purple-400 bg-purple-900/50 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}>
                      <div className="text-[11px] font-bold">RAG</div>
                      <div className="text-[9px] font-mono text-purple-300">Vector Search</div>
                    </div>
                  </div>

                  {activeStep >= 4 && (
                    <div className="text-xs font-mono text-purple-300 bg-purple-950/70 p-2.5 rounded-xl border border-purple-800/60">
                      ⚡ Action: {selectedEvent.aiWorkerAction}
                    </div>
                  )}
                </div>

                {/* Notification Worker */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  activeStep >= 4
                    ? 'border-blue-500 bg-blue-950/20 shadow-xl shadow-blue-500/10'
                    : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">Notification Worker</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 font-mono">
                      Outbound Channels
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Formats alerts, compiles digital invoices, generates WhatsApp templates, and dispatches push signals.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 text-center">
                      <div className="text-xs font-bold text-blue-400">FCM Push</div>
                      <div className="text-[9px] font-mono text-slate-400">Firebase Cloud Messaging</div>
                    </div>
                    <div className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 text-center">
                      <div className="text-xs font-bold text-emerald-400">WhatsApp</div>
                      <div className="text-[9px] font-mono text-slate-400">Meta Business API</div>
                    </div>
                  </div>

                  {activeStep >= 4 && (
                    <div className="text-xs font-mono text-blue-300 bg-blue-950/70 p-2.5 rounded-xl border border-blue-800/60">
                      🔔 Channel Target: {selectedEvent.notificationTarget}
                    </div>
                  )}
                </div>
              </div>

              {/* CONNECTOR ARROW 4 */}
              <div className="flex justify-center my-3">
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                  activeStep >= 5 ? 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 shadow-md shadow-emerald-500/10' : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}>
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Delivered to End Device Endpoints</span>
                </div>
              </div>

              {/* STAGE 5: ENDPOINT DELIVERY (MOBILE & CUSTOMER) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Endpoint */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 5
                    ? 'border-blue-500/80 bg-blue-950/30 shadow-lg shadow-blue-500/10'
                    : 'border-slate-800/80 bg-slate-900/40'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Mobile (Cashier / Store Manager)
                      </h5>
                    </div>
                    {activeStep >= 5 && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  {activeStep >= 5 ? (
                    <div className="text-xs font-mono text-blue-300 bg-blue-900/40 p-2 rounded-lg border border-blue-700/40">
                      {selectedEvent.fcmMessage}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Awaiting push delivery from FCM gateway...</p>
                  )}
                </div>

                {/* Customer Endpoint */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 5
                    ? 'border-emerald-500/80 bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800/80 bg-slate-900/40'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Customer (WhatsApp / Web)
                      </h5>
                    </div>
                    {activeStep >= 5 && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  {activeStep >= 5 ? (
                    <div className="text-xs font-mono text-emerald-300 bg-emerald-900/40 p-2 rounded-lg border border-emerald-700/40">
                      {selectedEvent.whatsappMessage}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Awaiting WhatsApp API webhook dispatch...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Simulation reset & re-run controls */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono text-center sm:text-left">
                {isSimulating
                  ? '⚡ Propagating event through Ingest ➔ Redis ➔ BullMQ ➔ Workers...'
                  : '✅ Simulation complete. Select any scenario above to trace another event.'}
              </span>
              <button
                onClick={() => runSimulation(selectedEvent)}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-run Trace</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── EVENT DIRECTORY & PIPELINE CATALOG ──────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Topic Catalog
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Neuroviax Event Matrix & Queue Routing
              </h2>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'ORDER', 'STOCK', 'PAYMENT', 'ALERT', 'AI', 'CHAT'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                    filterCategory === cat
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-4">Event Topic</th>
                  <th className="p-4">Ingestion Gateway</th>
                  <th className="p-4">BullMQ Queue</th>
                  <th className="p-4">Worker Pipeline</th>
                  <th className="p-4">Autonomous Business Action</th>
                  <th className="p-4">Target SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCatalog.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {item.name}
                    </td>
                    <td className="p-4 font-mono text-cyan-300">{item.channel}</td>
                    <td className="p-4 font-mono text-amber-300">{item.queue}</td>
                    <td className="p-4 text-purple-300">{item.worker}</td>
                    <td className="p-4 text-slate-300 max-w-xs">{item.action}</td>
                    <td className="p-4 font-mono text-emerald-400 font-semibold">{item.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── ARCHITECTURAL ADVANTAGES ──────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-2">
              Why This Event-Driven Moat Matters for Retailers
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Comparing legacy monolithic architectures with Neuroviax's distributed asynchronous event bus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Zero Database Lock Contention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                During busy POS rush hours, order writes are acknowledged in milliseconds via Redis Streams. Heavy inventory calculations and financial forecasts run in background BullMQ workers without locking tables.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Decoupled AI Copilot Workers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Isolation Forest fraud detection, XGBoost cash runway forecasting, and K-Means customer RFM run on isolated worker threads. Heavy machine learning workloads never slow down front-end cash registers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Instant Omnichannel Dispatch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic bifurcation of signals: FCM instantly notifies the store manager's mobile device about stockouts or fraud, while the WhatsApp worker delivers branded digital receipts and 1-tap reorder approvals.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 font-display">
              Test The Live System In Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6">
              Open the real-time ERP Dashboard, run live transactions, or explore the 6 Autonomous AI Copilots right in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Launch ERP Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/chatboard"
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center gap-2 border border-slate-700"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Open Executive Copilot</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ArchitecturePage;
