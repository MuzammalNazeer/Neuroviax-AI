import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import {
  Sparkles,
  ShieldCheck,
  Target,
  Users,
  Award,
  Globe2,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  Bot,
  Zap,
  Building2,
  Scale,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import SEO from '../components/SEO';

const STATS = [
  { value: '99.99%', label: 'Platform Uptime SLA', desc: 'Enterprise reliability guarantee' },
  { value: '6', label: 'Autonomous AI Agents', desc: 'Sales, Finance, Support, Legal & Ops' },
  { value: '<15ms', label: 'Global Edge Latency', desc: 'Distributed low-latency backend' },
  { value: '50k+', label: 'Workflows Executed', desc: 'Across digital businesses worldwide' },
];

const CORE_VALUES = [
  {
    icon: Bot,
    title: 'AI-First Autonomy',
    desc: 'We replace repetitive human drudgery with high-accuracy, deterministic AI workflows and continuous closed-loop operational learning.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Lock,
    title: 'Zero-Trust Security',
    desc: 'End-to-end 256-bit encryption, strict tenant isolation, JWT authentication, and PCI-DSS compliant Stripe subscription processing.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Scale,
    title: 'Legal & Business Compliance',
    desc: 'Built specifically to streamline lawyer-client contracts, automated dispute handling, regulatory audit trails, and multi-branch management.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: HeartHandshake,
    title: 'Customer-Centric Velocity',
    desc: 'Designed with feedback from solo practitioners to enterprise teams, offering instant onboarding, intuitive UI, and 24/7 dedicated support.',
    color: 'from-pink-500 to-rose-500',
  },
];

const MILESTONES = [
  { year: 'Phase 1', title: 'Foundation Architecture', desc: 'Core inventory, unified sales, order management, and RBAC authentication engine.' },
  { year: 'Phase 2', title: 'Autonomous AI Assistants', desc: 'Introduced 6 domain assistants covering demand velocity, restock triggers, and legal drafting.' },
  { year: 'Phase 3', title: 'Stripe Billing & Subscriptions', desc: 'Integrated recurring Stripe subscriptions, customer billing portal, and self-serve upgrade tiering.' },
  { year: 'Phase 4', title: 'Global Multi-Tenant Scale', desc: 'Multi-branch warehouse transfers, enterprise franchise analytics, and instant escrow settlement.' },
];

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <SEO
        title="About Neuroviax AI — Autonomous Operating Platform & Legal Ecosystem"
        description="Learn about Neuroviax AI's mission, architecture, leadership, security compliance, and commitment to transforming modern businesses with autonomous AI workflows."
      />

      <LandingNavbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            About Neuroviax AI
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Pioneering the Future of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Autonomous Business Operations
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Neuroviax AI (ABOP) is an AI-first operating platform engineered to unify orders, inventory, billing, lawyer marketplace contracts, and predictive intelligence into one cohesive autonomous loop.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/subscription/plans')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition flex items-center gap-2"
            >
              <span>View Subscription Plans</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-y border-slate-900 bg-slate-900/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Target className="w-4 h-4" />
              Our Core Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Democratizing Enterprise-Grade Intelligence for Growing Businesses
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Traditional ERP and business operating systems are brittle, expensive, and require dedicated IT departments. Neuroviax changes the paradigm by embedding autonomous AI agents directly into daily business operations.
            </p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic operational guards preventing stock-outs and cash-flow crunches.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Native Stripe Subscriptions billing with instant automated license provisioning.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-tenant tenant isolation ensuring complete data privacy and security.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              The Autonomous Operating Loop
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every sales order, inventory transfer, and client consultation updates our state graph in real time, triggering actionable intelligence without manual intervention.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">1. Data Ingestion & Audit</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Continuous</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">2. Pattern Recognition</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">AI Agents</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">3. Human-in-the-Loop Execution</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">1-Click Approve</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Our Guiding Principles</span>
          <h2 className="text-3xl font-bold text-white">Engineered for Trust & Reliability</h2>
          <p className="text-sm text-slate-400">
            Every feature in Neuroviax is designed around security, user transparency, and quantifiable business return on investment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, i) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${val.color} flex items-center justify-center text-slate-950 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{val.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{val.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Roadmap & Evolution */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Evolution Roadmap</span>
          <h2 className="text-3xl font-bold text-white">From Foundation to Global Scale</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {MILESTONES.map((m, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-2 relative">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {m.year}
              </span>
              <h4 className="text-base font-bold text-white pt-2">{m.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ready to Upgrade Your Operations?
            </h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Start with our Free tier or unlock unlimited AI drafting, automated multi-branch operations, and priority support.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>View Pricing Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default About;
