import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import SEO from '../components/SEO';
import {
  Scale,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Bot,
  Zap,
  ShieldCheck,
  Check,
  Building2,
  Globe,
  Layers,
} from 'lucide-react';

const COMPETITORS = [
  {
    name: 'Tally (India / Pakistan)',
    type: 'Legacy Desktop Accounting',
    overlapPercent: '30%',
    overlapDesc: 'Only static accounting ledger & basic inventory counting',
    limits: '0% AI capability, high latency, offline data silos, zero automated reorders',
    neuroviaxAdvantage: 'Continuous AI reorder proposals + native 1-tap WhatsApp workflows on cloud',
  },
  {
    name: 'Zoho One / Books',
    type: 'Horizontal Enterprise Suite',
    overlapPercent: '25%',
    overlapDesc: 'Standard CRM, invoices & heavy multi-app bloat',
    limits: 'AI is a bolted-on checkbox feature; not an autonomous closed-loop operating default',
    neuroviaxAdvantage: 'Domain-scoped AI copilots running autonomously on a synchronized ledger',
  },
  {
    name: 'Odoo / ERPNext',
    type: 'Modular ERP Framework',
    overlapPercent: '35%',
    overlapDesc: 'Extensible database models and POS checkout module',
    limits: 'Complex configuration, costly self-hosting consultants, passive data dashboards',
    neuroviaxAdvantage: 'Instant plug-and-play ABOP loop with zero consulting overhead',
  },
  {
    name: 'SAP Business One',
    type: 'Heavyweight Legacy ERP',
    overlapPercent: '20%',
    overlapDesc: 'Financial journals and enterprise supply chain',
    limits: 'Requires $50k+ implementation, 6-month rollouts, unusable on mobile devices',
    neuroviaxAdvantage: 'Tailored for emerging market SMEs, starts in minutes, 90% cheaper',
  },
];

export const DifferentiatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      <SEO
        title="The 30/70 Differentiator & Competitive Matrix — Neuroviax AI"
        description="Discover how Neuroviax AI delivers a 70% autonomous AI moat while covering the 30% commodity ERP foundation, outperforming Tally, Zoho, and legacy ERPs."
      />

      <LandingNavbar />

      {/* Ambient glow */}
      <div className="fixed top-20 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Scale className="w-4 h-4" />
          <span>Strategic Architectural Moat</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-6">
          The 30/70 <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-emerald-400 bg-clip-text text-transparent">
            Autonomous Differentiator
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
          Traditional ERP vendors treat basic records (invoices, inventory logs) as their entire product. At Neuroviax, those form only <strong>30%</strong> of the foundation — the remaining <strong>70%</strong> is our autonomous AI intelligence moat.
        </p>
      </section>

      {/* 30% vs 70% Visual Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* The 30% Foundation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                30% TABLE-STAKES COMMODITY
              </span>
              <Building2 className="w-6 h-6 text-slate-500" />
            </div>

            <h3 className="text-2xl font-black text-white mb-3">Foundational Business Records</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Every ERP can record a transaction. We built this foundation with high-throughput MERN architecture to match industry standards without bloat.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Multi-branch inventory ledger & SKU master catalog</span>
              </li>
              <li className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>POS cart calculation, discount, & tax receipting</span>
              </li>
              <li className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Customer records, supplier list & categorized expenses</span>
              </li>
            </ul>
          </div>

          {/* The 70% Autonomous Moat */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/40 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/40">
                70% AUTONOMOUS AI MOAT
              </span>
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-3">Continuous ABOP Intelligence</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This is what sets Neuroviax apart: closed-loop AI assistants that analyze, predict, and execute workflows before operational problems happen.
            </p>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>6 Domain Copilots</strong> running real-time prescriptive analysis</span>
              </li>
              <li className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Human-in-the-Loop Risk Gating:</strong> 1-click approvals for POs & campaigns</span>
              </li>
              <li className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>30-Day Predictive Cash Flow</strong> with regional currency support (PKR/INR/USD)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Competitive Comparison Matrix */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white">Competitive Landscape Matrix</h3>
            <p className="text-xs text-slate-400">How Neuroviax stacks up against legacy alternatives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPETITORS.map((comp, idx) => (
              <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{comp.name}</h4>
                    <span className="text-[11px] text-slate-400">{comp.type}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-600/30">
                    {comp.overlapPercent} Overlap
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-400">
                    <span className="font-semibold text-slate-300">Overlap:</span>
                    <span>{comp.overlapDesc}</span>
                  </div>
                  <div className="flex items-start gap-2 text-rose-450">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-rose-300">{comp.limits}</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Neuroviax Advantage:</strong> {comp.neuroviaxAdvantage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default DifferentiatorPage;
