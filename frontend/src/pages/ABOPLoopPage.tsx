import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import SEO from '../components/SEO';
import {
  Layers,
  Database,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  Zap,
  Lock,
  Workflow,
  Check,
  Play,
} from 'lucide-react';

const LOOP_STEPS = [
  {
    step: 1,
    title: 'Record',
    subtitle: 'Autonomous Ledger Ingestion',
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/40',
    icon: Database,
    description: 'Every sale, POS checkout, invoice, return, and stock movement is recorded with millisecond precision without manual data entry.',
    details: [
      'Synchronous Mongoose + In-Memory ledger writing',
      'Immutable audit trail creation with SHA-256 integrity check',
      'Real-time multi-branch inventory balance indexing',
    ],
    demoLog: 'POST /api/orders [200 OK] — 12 items sold at Downtown Branch. SKU #SFT-001 stock dropped to 8 units.',
  },
  {
    step: 2,
    title: 'Analyze',
    subtitle: 'Continuous Domain Intelligence',
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-500/40',
    icon: Cpu,
    description: 'Specialized domain AI copilots evaluate patterns, seasonal velocity, cash flow runway, and safety stock thresholds in real time.',
    details: [
      'Demand velocity scoring per SKU and branch',
      'Supplier lead time and price arbitrage matrix cross-referencing',
      'Anomaly detection for stock shrinkage or unexpected expense surges',
    ],
    demoLog: 'AI Copilot evaluated sales velocity: SKU #SFT-001 will deplete in 4.2 days. Reorder threshold triggered.',
  },
  {
    step: 3,
    title: 'Recommend',
    subtitle: 'Prescriptive Decision Generation',
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/40',
    icon: Sparkles,
    description: 'Rather than dumping raw charts on the user, the platform produces specific, quantified, risk-tiered proposals with verified ROI.',
    details: [
      'Action proposal: Draft Purchase Order with preferred supplier',
      'Confidence scoring (85% to 99%)',
      'Risk categorisation (Low / Medium / High) based on transaction value',
    ],
    demoLog: 'Generated Proposal #REC-4091: Order 50 units from Global Electronics Supply. Cost $2,250. Est. margin 48%.',
  },
  {
    step: 4,
    title: 'Approve',
    subtitle: 'Human-in-the-Loop Safeguard',
    color: 'from-rose-500 to-pink-500',
    borderColor: 'border-rose-500/40',
    icon: ShieldCheck,
    description: 'Autonomous execution is strictly gated. The business owner or manager receives a 1-tap notification to approve, edit, or reject.',
    details: [
      '1-Tap approval via web dashboard or WhatsApp notification',
      'Role-based governance: Only owners/managers can approve high-value POs',
      'Audit log tracks exact user, timestamp, and justification',
    ],
    demoLog: 'Manager (Muzammal Nazir) approved Proposal #REC-4091 via Dashboard at 14:32:09 GMT.',
  },
  {
    step: 5,
    title: 'Execute',
    subtitle: 'Instant Automated Orchestration',
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-500/40',
    icon: Zap,
    description: 'Upon approval, the system dispatches purchase orders, updates supplier ledgers, reserves incoming inventory, and adjusts cash forecasts.',
    details: [
      'PO generated and dispatched via email / supplier EDI connector',
      'Pending accounts payable entry registered in Finance module',
      'Automated tracking timeline initiated for inbound delivery',
    ],
    demoLog: 'PO #PO-9918 created in system. Supplier notified. Expected delivery in 3 days.',
  },
];

export const ABOPLoopPage: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = LOOP_STEPS[activeStepIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      <SEO
        title="The ABOP Closed-Loop Operating Model — Neuroviax AI"
        description="Learn how the Autonomous Business Operating Platform (ABOP) closed-loop works: Record, Analyze, Recommend, Approve, and Execute."
      />

      <LandingNavbar />

      {/* Ambient background glow */}
      <div className="fixed top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Workflow className="w-4 h-4" />
          <span>The Closed-Loop Autonomous Engine</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-6">
          The 5-Stage <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            ABOP Operating Loop
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
          Traditional ERPs act as passive data cemeteries. Neuroviax ABOP transforms records into continuous, autonomous action loops that keep your enterprise humming with 99.9% operational efficiency.
        </p>
      </section>

      {/* Interactive Loop Diagram & Step Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {LOOP_STEPS.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isPassed = idx < activeStepIndex;
            const IconComponent = step.icon;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 border-teal-500/60 shadow-xl shadow-teal-500/10 ring-1 ring-teal-500/40'
                    : isPassed
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-850 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isCurrent ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Stage 0{step.step}
                  </span>
                  <IconComponent className={`w-4 h-4 ${isCurrent ? 'text-teal-400' : 'text-slate-500'}`} />
                </div>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Stage Explanation */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeStep.color} flex items-center justify-center text-white shadow-lg`}>
                    {React.createElement(activeStep.icon, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                      Stage 0{activeStep.step} of 05
                    </span>
                    <h2 className="text-2xl font-black text-white">{activeStep.title}: {activeStep.subtitle}</h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  {activeStep.description}
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Under-the-Hood Mechanisms:</h4>
                  {activeStep.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveStepIndex((prev) => (prev + 1) % LOOP_STEPS.length)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer"
                  >
                    <span>Next Stage: {LOOP_STEPS[(activeStepIndex + 1) % LOOP_STEPS.length].title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Event Stream Simulation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-400" />
                    <span>Real-time Event Execution Log</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    LIVE STREAM
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-xs text-slate-300 space-y-4 shadow-inner">
                  <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800/80 flex items-center justify-between">
                    <span>TRANSACTION ID: #TXN-90281-NX</span>
                    <span>TIMESTAMP: {new Date().toLocaleTimeString()}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-teal-300 leading-relaxed">
                    {activeStep.demoLog}
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400">Ledger State Guarantee</div>
                    <div className="text-[11px] text-slate-400">
                      Atomic rollback on network interruption, idempotent retry guarantees, and zero phantom inventory drift.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ABOPLoopPage;
