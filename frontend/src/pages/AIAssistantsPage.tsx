import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import SEO from '../components/SEO';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  MessageCircle,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Zap,
  Activity,
  Layers,
  Cpu,
  RefreshCw,
  Clock,
  Play,
} from 'lucide-react';

const ASSISTANTS = [
  {
    id: 'sales',
    name: 'Sales AI Assistant',
    badge: 'Revenue Velocity Engine',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-500/40',
    bgGlow: 'from-emerald-500/10 to-teal-500/5',
    pill: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40',
    domain: 'POS · Orders · Customer Lifetime Value · Product Conversions',
    objective: 'Maximize daily transaction volume, eliminate dead stock, and dynamically forecast demand surges.',
    inputs: ['Real-time checkout stream', 'Customer purchase frequency', 'Seasonal velocity coefficients'],
    outputs: ['Segment-targeted product recommendations', 'Basket upselling suggestions', 'Stockout risk warnings'],
    demoSignal: {
      title: 'Demand Spike Detected: Smart Fitness Tracker X1',
      confidence: 94,
      risk: 'Low Risk · High Upside',
      action: 'Trigger flash bundle promotion with accessories for top 15% VIP customers.',
      impact: '+18.4% Projected Weekly GMV',
    },
  },
  {
    id: 'procurement',
    name: 'Procurement AI Assistant',
    badge: 'Phase 3 Live Slice',
    icon: ShoppingCart,
    color: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-500/40',
    bgGlow: 'from-blue-500/10 to-indigo-500/5',
    pill: 'bg-blue-950/60 text-blue-300 border-blue-600/40',
    domain: 'Suppliers · Lead Times · Unit Economics · Purchase Orders',
    objective: 'Continuously analyze inventory depletion velocity and prepare ready-to-execute supplier POs with 1-click approval.',
    inputs: ['Inventory movement ledger', 'Supplier price quote matrix', 'Transit lead times'],
    outputs: ['Automated PO drafting', 'Optimal supplier price arbitrage', 'Safety stock replenishment trigger'],
    demoSignal: {
      title: 'Restock Proposal: Wireless ANC Headphones',
      confidence: 91,
      risk: 'Medium Risk · Verified Lead Time',
      action: 'Generate PO #PO-8821 for 60 units with Supplier A (saved $420 vs Supplier B).',
      impact: 'Prevents 12-day stockout crisis',
    },
  },
  {
    id: 'inventory',
    name: 'Inventory AI Assistant',
    badge: 'Multi-Warehouse Copilot',
    icon: Package,
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/40',
    bgGlow: 'from-amber-500/10 to-orange-500/5',
    pill: 'bg-amber-950/60 text-amber-300 border-amber-600/40',
    domain: 'SKU Batches · Warehouse Transfer · Shrinkage Anomaly Detection',
    objective: 'Maintain optimal inventory equilibrium across all physical branches with zero blind spots.',
    inputs: ['Multi-branch stock levels', 'Scan & picking logs', 'Audit variance records'],
    outputs: ['Inter-branch balance transfer orders', 'Shrinkage anomaly alerts', 'Expiry date alerts'],
    demoSignal: {
      title: 'Stock Imbalance: Downtown vs North Branch',
      confidence: 96,
      risk: 'Low Risk · Internal Transfer',
      action: 'Transfer 25 units from Downtown (overstocked) to North Branch (near zero).',
      impact: 'Zero new capital outlay required',
    },
  },
  {
    id: 'marketing',
    name: 'Marketing AI Assistant',
    badge: 'Autonomous Campaign Orchestrator',
    icon: BarChart3,
    color: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-500/40',
    bgGlow: 'from-pink-500/10 to-rose-500/5',
    pill: 'bg-pink-950/60 text-pink-300 border-pink-600/40',
    domain: 'Customer Clusters · WhatsApp Broadcasts · Churn Prevention',
    objective: 'Identify high-value customer cohorts and launch personalized retention campaigns across WhatsApp and SMS.',
    inputs: ['RFM (Recency, Frequency, Monetary) scores', 'Cart abandonment stream', 'WhatsApp open rates'],
    outputs: ['Automated re-engagement offers', 'VIP loyalty tier rewards', 'Broadcast ROI attribution'],
    demoSignal: {
      title: 'Dormant VIP Segment Identified (34 Customers)',
      confidence: 88,
      risk: 'Low Risk · High Retention Value',
      action: 'Dispatch WhatsApp exclusive 10% loyalty incentive code.',
      impact: '$3,200 estimated reactivated revenue',
    },
  },
  {
    id: 'support',
    name: 'Customer Support AI Assistant',
    badge: 'Omnichannel Concierge',
    icon: MessageCircle,
    color: 'from-violet-500 to-purple-500',
    borderColor: 'border-violet-500/40',
    bgGlow: 'from-violet-500/10 to-purple-500/5',
    pill: 'bg-violet-950/60 text-violet-300 border-violet-600/40',
    domain: 'WhatsApp Chats · Inquiries · Order Status Inquiries · Returns',
    objective: 'Provide instant, contextual answers regarding order tracking, product stock, and billing with human escalation.',
    inputs: ['Incoming WhatsApp/Web messages', 'Order database status', 'Business FAQs & Return policy'],
    outputs: ['Instant order tracking lookups', 'Auto-drafted refund resolutions', 'Urgent dispute flags'],
    demoSignal: {
      title: 'Delivery Status Inquiry: Order #NX-9402',
      confidence: 99,
      risk: 'Autonomous Low-Risk Resolution',
      action: 'Sent tracking courier link & estimated arrival (Today 4:00 PM) to customer via WhatsApp.',
      impact: '0s wait time for customer',
    },
  },
  {
    id: 'finance',
    name: 'Finance & Cash-Flow AI Assistant',
    badge: 'Predictive Treasury Copilot',
    icon: DollarSign,
    color: 'from-teal-500 to-cyan-500',
    borderColor: 'border-teal-500/40',
    bgGlow: 'from-teal-500/10 to-cyan-500/5',
    pill: 'bg-teal-950/60 text-teal-300 border-teal-600/40',
    domain: 'Cash Inflow/Outflow · Payables · Receivables · Tax Compliance',
    objective: 'Forecast 30-day runway, flag unpaid vendor liabilities, and prevent working capital crunches.',
    inputs: ['Stripe & gateway settlement feeds', 'Recurring operational expenses', 'Accounts receivable due dates'],
    outputs: ['30-Day cash runway simulation', 'Expense anomaly alerts', 'Automated VAT/GST summaries'],
    demoSignal: {
      title: 'Liquidity Safeguard: Upcoming Supplier Obligations',
      confidence: 93,
      risk: 'High Advisory Priority',
      action: 'Schedule pending invoice settlement on Day 14 post Stripe payout arrival.',
      impact: 'Protects operational cash buffer',
    },
  },
];

export const AIAssistantsPage: React.FC = () => {
  const [selectedAssistant, setSelectedAssistant] = useState(ASSISTANTS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<'idle' | 'analyzing' | 'done'>('idle');

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationStep('analyzing');
    setTimeout(() => {
      setSimulationStep('done');
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      <SEO
        title="6 Autonomous AI Assistants — Neuroviax AI"
        description="Explore the 6 domain-scoped AI assistants powering the Neuroviax Autonomous Business Operating Platform (ABOP): Sales, Procurement, Inventory, Marketing, Support, and Finance."
      />

      <LandingNavbar />

      {/* Ambient background glows */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Bot className="w-4 h-4" />
          <span>Synchronized Domain Intelligence</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-6">
          Meet the 6 Specialized <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Autonomous AI Assistants
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
          Unlike generic chat wrappers, Neuroviax assistants are embedded deep into your business ledger. They operate 24/7 across Sales, Procurement, Inventory, Marketing, Support, and Finance with guaranteed human approval safeguards.
        </p>
      </section>

      {/* Main Interactive Assistant Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Assistant Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
          {ASSISTANTS.map((ast) => {
            const isSelected = selectedAssistant.id === ast.id;
            const IconComponent = ast.icon;
            return (
              <button
                key={ast.id}
                onClick={() => {
                  setSelectedAssistant(ast);
                  setSimulationStep('idle');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${ast.color} flex items-center justify-center text-slate-950 font-bold shadow-md`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{ast.name.replace(' AI Assistant', '')}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Copilot</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Assistant Deep-Dive Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAssistant.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Top row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedAssistant.color} flex items-center justify-center shadow-xl shadow-emerald-500/10 shrink-0`}>
                  {React.createElement(selectedAssistant.icon, { className: 'w-7 h-7 text-white' })}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white">{selectedAssistant.name}</h2>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${selectedAssistant.pill}`}>
                      {selectedAssistant.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedAssistant.domain}</p>
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Stream...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Live Decision</span>
                  </>
                )}
              </button>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
              {/* Objective & Scope */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Core Objective
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {selectedAssistant.objective}
                </p>

                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-4">Continuous Data Feeds</h3>
                <ul className="space-y-2">
                  {selectedAssistant.inputs.map((inp, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Outputs */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Actionable Deliverables
                </h3>
                <div className="space-y-2.5">
                  {selectedAssistant.outputs.map((out, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300">{out}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-2xl">
                  <h4 className="text-[11px] font-bold text-emerald-400 uppercase">Human-in-the-Loop Safeguard</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Every output requires explicit manager or owner confirmation before updating stock, dispatching funds, or executing supplier orders.
                  </p>
                </div>
              </div>

              {/* Live Signal Sandbox */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Live Signal Preview
                </h3>

                <div className="bg-slate-950 rounded-2xl border border-indigo-500/30 p-5 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {selectedAssistant.demoSignal.confidence}% AI Confidence
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedAssistant.demoSignal.risk}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {selectedAssistant.demoSignal.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono">
                      "{selectedAssistant.demoSignal.action}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Projected Impact:</span>
                    <span className="text-emerald-400 font-bold">{selectedAssistant.demoSignal.impact}</span>
                  </div>

                  {simulationStep === 'done' && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Action queued for 1-tap Manager Approval in Dashboard!</span>
                    </div>
                  )}
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

export default AIAssistantsPage;
