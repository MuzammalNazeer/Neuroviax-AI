import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import SEO from '../components/SEO';
import {
  CreditCard,
  Check,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Zap,
  Bot,
  Building2,
} from 'lucide-react';

const TIERS = [
  {
    id: 'starter',
    name: 'Free Starter',
    badge: 'ZERO RISK · PHASE 1',
    pricePKR: '0',
    priceUSD: '0',
    period: '/forever',
    desc: 'Solo entrepreneurs & early single-location retail setups testing autonomous workflows.',
    features: [
      '1 Physical Branch & 2 Team Accounts',
      'Up to 250 Inventory SKUs & POS Checkout',
      'Basic Sales & Inventory Movement Ledger',
      'Nodemailer Password OTP & Audit Logs',
      'Community Email Support (24h SLA)',
    ],
    popular: false,
    cta: 'Get Started Free',
    href: '/register',
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'MULTI-BRANCH SCALE',
    pricePKR: '12,000',
    priceUSD: '39',
    period: '/month',
    desc: 'Growing merchants needing multi-warehouse tracking and automated restocking.',
    features: [
      'Up to 3 Branches & 5 Team Members',
      'Unlimited SKUs & Real-time Stock Sync',
      'Procurement AI Assistant (Supplier comparison)',
      'Customer CRM & segmentation triggers',
      'WhatsApp Order Alerts & Receipts',
      'Priority Email Support (<4h SLA)',
    ],
    popular: false,
    cta: 'Launch Growth Workspace',
    href: '/register',
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'MOST POPULAR · 100% ABOP',
    pricePKR: '28,000',
    priceUSD: '99',
    period: '/month',
    desc: 'Established SMEs deploying the full 6-Assistant autonomous operating loop.',
    features: [
      'All 6 Domain-Scoped AI Assistants',
      'Predictive 30-Day Cash-Flow Forecasting',
      'Human-in-the-Loop Risk Gating (Low/Med/High)',
      '1-Tap WhatsApp Approval Workflows',
      'Unlimited Branches & Custom Team Roles',
      'Shrinkage Anomaly & Demand Surge Detection',
      'Dedicated Account Manager & 1h SLA',
    ],
    popular: true,
    cta: 'Deploy Full ABOP Suite',
    href: '/register',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'FRANCHISE & CUSTOM',
    pricePKR: 'Custom',
    priceUSD: 'Custom',
    period: '/organization',
    desc: 'Large retail chains, franchise networks, and multi-entity organizations.',
    features: [
      'Dedicated LLM instance & private fine-tuning',
      'Multi-tenant franchise console & global telemetry',
      'Custom ERP & Oracle/SAP data migration',
      '99.99% Uptime SLA & 24/7 Phone Support',
      'Exclusive Stripe Card Payments & 3D Secure Checkout',
    ],
    popular: false,
    cta: 'Contact Enterprise Team',
    href: '/contact',
  },
];

export const PricingPage: React.FC = () => {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      <SEO
        title="Transparent Pricing & Subscription Plans — Neuroviax AI"
        description="Choose the right plan for your business: Free Starter, Growth, Professional ABOP, or Enterprise Franchise with multi-currency pricing in PKR and USD."
      />

      <LandingNavbar />

      {/* Ambient background glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <section className="pt-32 pb-14 px-4 sm:px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <CreditCard className="w-4 h-4" />
          <span>Transparent & Predictable ROI</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-6">
          Simple, Transparent <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Autonomous ERP Pricing
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
          Start for free, scale as your business grows. No hidden transaction penalties, no expensive legacy consulting hours.
        </p>

        {/* Currency Switcher */}
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setCurrency('PKR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              currency === 'PKR'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PKR (₨) — Regional
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              currency === 'USD'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            USD ($) — Global
          </button>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => {
            const price = currency === 'PKR' ? tier.pricePKR : tier.priceUSD;
            const symbol = currency === 'PKR' ? '₨ ' : '$';
            return (
              <div
                key={tier.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                  tier.popular
                    ? 'bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {tier.badge}
                  </span>
                  <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                  <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed mb-6">
                    {tier.desc}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-800">
                    {price === 'Custom' ? (
                      <span className="text-3xl font-black text-white">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-white">{symbol}{price}</span>
                        <span className="text-xs text-slate-400">{tier.period}</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={tier.href}
                  className={`w-full text-center py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-14 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
          <div className="text-xs text-slate-400">
            <strong className="text-white">100% Risk-Free Commitment:</strong> Upgrade, downgrade, or cancel anytime. All plans include automated database backups and data portability export in JSON/CSV format.
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default PricingPage;
