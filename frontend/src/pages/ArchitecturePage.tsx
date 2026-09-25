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
} from 'lucide-react';

interface SimulatedEvent {
  id: string;
  name: string;
  category: 'ORDER' | 'STOCK' | 'PAYMENT' | 'AI' | 'ALERT' | 'CHAT';
  payload: string;
  orchestratorAction: string;
  fcmMessage: string;
  whatsappMessage: string;
  color: string;
}

const SAMPLE_EVENTS: SimulatedEvent[] = [
  {
    id: 'evt-1',
    name: 'POS Bulk Order Placed',
    category: 'ORDER',
    payload: 'Order #NX-8821 for ₨ 42,500 by Retail Hub Lahore',
    orchestratorAction: 'Procurement & Inventory Copilots recalculate safety buffer and EOQ',
    fcmMessage: '⚡ Order #NX-8821 Confirmed: ₨ 42,500 recorded in POS ledger',
    whatsappMessage: '✅ Hi Hamza, your order #NX-8821 (₨ 42,500) has been approved and packed!',
    color: 'emerald',
  },
  {
    id: 'evt-2',
    name: 'Low Stock Threshold Warning',
    category: 'STOCK',
    payload: 'SKU #SKU-994 (Organic Green Tea) dropped to 14 units (Safety buffer: 25)',
    orchestratorAction: 'Isolation Forest + Time-Series Exponential Smoothing triggers PO recommendation',
    fcmMessage: '⚠️ Stockout Alert: SKU-994 will exhaust in 2.4 days at current velocity',
    whatsappMessage: '📦 Supplier Alert: Auto-generated RFQ #PO-109 ready for Alpha Distributors approval.',
    color: 'amber',
  },
  {
    id: 'evt-3',
    name: 'Anomaly / Payment Fraud Detected',
    category: 'ALERT',
    payload: 'Outlier transaction ₨ 380,000 at 02:45 AM from unknown IP subnet',
    orchestratorAction: 'iTree Anomaly Shield (Score 0.89) flags Z-score deviation and isolates transaction',
    fcmMessage: '🛡️ Fraud Shield: High-risk transaction ₨ 380,000 quarantined for manual review',
    whatsappMessage: '🚨 Security Alert: High-value transaction flagged. Tap to approve or freeze immediately.',
    color: 'rose',
  },
  {
    id: 'evt-4',
    name: 'Copilot Business Intelligence Query',
    category: 'CHAT',
    payload: 'User prompt: "What is our predicted cash-runway for the next 30 days?"',
    orchestratorAction: 'XGBoost/LightGBM Cash Flow Engine retrieves historical rolling net flow',
    fcmMessage: '💡 Copilot Synthesis Complete: Projected 30-day net cash flow is +₨ 1,240,000',
    whatsappMessage: '📊 Neuroviax Copilot: Your 30-day liquidity forecast report is generated.',
    color: 'blue',
  },
];

export const ArchitecturePage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<SimulatedEvent>(SAMPLE_EVENTS[0]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const runSimulation = (event: SimulatedEvent) => {
    setSelectedEvent(event);
    setActiveStep(1);
    setIsSimulating(true);

    const stepIntervals = [1, 2, 3, 4, 5, 6];
    stepIntervals.forEach((step, idx) => {
      setTimeout(() => {
        setActiveStep(step);
        if (step === 6) {
          setIsSimulating(false);
        }
      }, (idx + 1) * 700);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <SEO
        title="Complete Distributed Architecture — Neuroviax AI"
        description="Explore the real-time event-driven architecture of Neuroviax AI: React Web, Socket.IO, Node.js Express, MongoDB, Redis Pub/Sub, Event System, AI Orchestrator, and Notification Services."
      />
      <LandingNavbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── HERO BANNER ────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-5 shadow-lg shadow-emerald-950/40"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Recommended Distributed Architecture</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-5 max-w-4xl mx-auto leading-tight"
          >
            Real-Time Event-Driven <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Enterprise ABOP Architecture
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed"
          >
            From low-latency WebSocket communication to Redis pub/sub streams, event-driven orchestrators, machine learning models, and automated customer touchpoints across FCM and WhatsApp.
          </motion.p>
        </section>

        {/* ── INTERACTIVE SIGNAL FLOW SIMULATOR ────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  Live Event Signal Simulator
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Watch Signals Propagate Across The Stack
                </h2>
              </div>

              {/* Event selector buttons */}
              <div className="flex flex-wrap gap-2">
                {SAMPLE_EVENTS.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => runSimulation(evt)}
                    disabled={isSimulating}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedEvent.id === evt.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    } disabled:opacity-50`}
                  >
                    <Play className="w-3 h-3" />
                    <span>{evt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── PIPELINE GRAPH (VERTICAL / DESKTOP RESPONSIVE) ── */}
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* TIER 1: CLIENT */}
              <div
                className={`transition-all duration-500 p-4 sm:p-5 rounded-2xl border ${
                  activeStep >= 1
                    ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      WEB
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">React Web + Socket.IO Client</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-300 font-mono">
                          Client UI Tier
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Initiates user action, order dispatch, POS barcode scan, or conversational prompt.
                      </p>
                    </div>
                  </div>
                  {activeStep >= 1 && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                      <Zap className="w-3.5 h-3.5" /> Dispatched
                    </span>
                  )}
                </div>
              </div>

              {/* ARROW 1 */}
              <div className="flex justify-center -my-2">
                <div className={`flex items-center gap-1 text-[11px] font-mono px-3 py-1 rounded-full border transition-all ${
                  activeStep >= 2 ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300 shadow-md' : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}>
                  <Radio className="w-3 h-3 animate-spin" />
                  <span>WebSocket Connection (Low Latency)</span>
                  <ArrowDown className="w-3 h-3" />
                </div>
              </div>

              {/* TIER 2: NODE.JS BACKEND */}
              <div
                className={`transition-all duration-500 p-4 sm:p-5 rounded-2xl border ${
                  activeStep >= 2
                    ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      NODE
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Node.js Backend (Express + Socket.IO)</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 font-mono">
                          API Gateway & Auth
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Authenticates JWT, validates payload integrity, and marshals event payloads into data layers.
                      </p>
                    </div>
                  </div>
                  {activeStep >= 2 && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Handled
                    </span>
                  )}
                </div>
              </div>

              {/* TIER 3: DUAL DATA STORE (MONGODB + REDIS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MongoDB */}
                <div
                  className={`transition-all duration-500 p-4 rounded-2xl border ${
                    activeStep >= 3
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      MongoDB Database
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Primary persistence engine for multi-tenant users, products, orders, inventory logs, and ledgers.
                  </p>
                  {activeStep >= 3 && (
                    <div className="mt-2 text-[10px] font-mono text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-lg inline-block">
                      ✓ Document Persisted
                    </div>
                  )}
                </div>

                {/* Redis */}
                <div
                  className={`transition-all duration-500 p-4 rounded-2xl border ${
                    activeStep >= 3
                      ? 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/10'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Radio className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Redis Pub/Sub + Streams
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    High-throughput queue, state cache, real-time message broadcasting, and event distribution.
                  </p>
                  {activeStep >= 3 && (
                    <div className="mt-2 text-[10px] font-mono text-rose-300 bg-rose-900/40 px-2 py-1 rounded-lg inline-block">
                      ✓ Stream Published
                    </div>
                  )}
                </div>
              </div>

              {/* TIER 4: EVENT SYSTEM */}
              <div
                className={`transition-all duration-500 p-4 sm:p-5 rounded-2xl border ${
                  activeStep >= 4
                    ? 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                      BUS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Event System</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-300 font-mono">
                          Topic Routing
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['ORDER', 'STOCK', 'PAYMENT', 'AI', 'ALERT', 'CHAT'].map((tag) => (
                          <span
                            key={tag}
                            className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                              selectedEvent.category === tag && activeStep >= 4
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {tag}_EVENT
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {activeStep >= 4 && (
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Routed
                    </span>
                  )}
                </div>
              </div>

              {/* TIER 5: AI ORCHESTRATOR */}
              <div
                className={`transition-all duration-500 p-4 sm:p-5 rounded-2xl border ${
                  activeStep >= 5
                    ? 'border-purple-500/80 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          AI Orchestrator (ML Models + LLM + RAG + Agents)
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 font-mono">
                          Decision Engine
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Isolation Forest iTrees, Cosine Vectors, XGBoost, LightGBM, K-Means & Conversational Copilot.
                      </p>
                      {activeStep >= 5 && (
                        <div className="mt-2 text-xs font-mono text-purple-300 bg-purple-900/40 p-2 rounded-xl border border-purple-700/50">
                          ⚡ Action: {selectedEvent.orchestratorAction}
                        </div>
                      )}
                    </div>
                  </div>
                  {activeStep >= 5 && (
                    <span className="text-xs font-mono text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Synthesized
                    </span>
                  )}
                </div>
              </div>

              {/* TIER 6: NOTIFICATION SERVICE (FCM + WHATSAPP) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FCM */}
                <div
                  className={`transition-all duration-500 p-4 rounded-2xl border ${
                    activeStep >= 6
                      ? 'border-blue-500/80 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        FCM (Mobile / Web Push)
                      </h4>
                    </div>
                    {activeStep >= 6 && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Delivered to Store Manager, Cashier, and Enterprise Staff devices.
                  </p>
                  {activeStep >= 6 && (
                    <div className="text-xs font-mono text-blue-300 bg-blue-900/40 p-2 rounded-xl border border-blue-700/40">
                      {selectedEvent.fcmMessage}
                    </div>
                  )}
                </div>

                {/* WhatsApp */}
                <div
                  className={`transition-all duration-500 p-4 rounded-2xl border ${
                    activeStep >= 6
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        WhatsApp Business Gateway
                      </h4>
                    </div>
                    {activeStep >= 6 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Instant receipts, interactive approval buttons, and customer touchpoints.
                  </p>
                  {activeStep >= 6 && (
                    <div className="text-xs font-mono text-emerald-300 bg-emerald-900/40 p-2 rounded-xl border border-emerald-700/40">
                      {selectedEvent.whatsappMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Simulation reset & re-run controls */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {isSimulating ? 'Propagating event through pipeline...' : 'Simulation complete. Click any scenario above to test another event.'}
              </span>
              <button
                onClick={() => runSimulation(selectedEvent)}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-run Scenario</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── ARCHITECTURAL PILLARS DETAILED BREAKDOWN ────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
              Core Architectural Tiers
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Engineered for high throughput, sub-second latency, and fault tolerance across modern distributed deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Real-Time WebSocket Fabric</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Eliminates legacy HTTP polling with bidirectional Socket.IO channels. Immediate state syncing for POS cashiers, inventory updates, and live copilot conversational streaming.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>• Under 40ms payload propagation</li>
                <li>• Automatic reconnection & backoff</li>
                <li>• Room-based tenant isolation</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Integrated AI Orchestrator</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Blends unsupervised mathematical algorithms (Isolation Forest, Cosine Similarity, K-Means) with gradient-boosted ensembles (XGBoost, LightGBM) and conversational LLM reasoning.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>• Pure zero-latency Node math models</li>
                <li>• Explainable SHAP feature weights</li>
                <li>• 6 synchronized domain copilots</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Omnichannel Dispatch Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Multi-channel notifications keep teams and customers aligned. Firebase Cloud Messaging (FCM) pushes urgent operational alerts while WhatsApp delivers interactive customer order confirmations.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>• Official WhatsApp API integration</li>
                <li>• Instant 1-tap PO approvals</li>
                <li>• Native web & mobile push notifications</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION ────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 font-display">
              Ready to Experience The Architecture Live?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6">
              Log into your demo workspace or explore the full interactive AI decision cockpits right inside your browser.
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
                to="/abop-loop"
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center gap-2 border border-slate-700"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Explore ABOP Loop</span>
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
