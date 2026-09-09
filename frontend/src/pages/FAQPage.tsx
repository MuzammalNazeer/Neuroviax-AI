import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import SEO from '../components/SEO';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Search,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Bot,
  Layers,
  CreditCard,
  Lock,
} from 'lucide-react';

interface FAQCategory {
  title: string;
  items: { q: string; a: string }[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: 'ABOP & Autonomous Operations',
    items: [
      {
        q: 'What is an Autonomous Business Operating Platform (ABOP)?',
        a: 'An ABOP is an AI-first evolution of traditional ERP systems. Instead of merely acting as a passive ledger where employees type in numbers after the fact, an ABOP features specialized domain AI agents that continuously evaluate inventory turnover, forecast cash flow, draft purchase orders, and trigger marketing broadcasts with 1-click human approval.',
      },
      {
        q: 'How does the 5-stage ABOP loop operate?',
        a: 'The loop executes five continuous stages: (1) Record transactions in real time, (2) Analyze patterns with domain intelligence, (3) Recommend concrete quantified proposals, (4) Approve via human-in-the-loop review, and (5) Execute automated actions across stock, ledgers, and supplier communication.',
      },
      {
        q: 'Can Neuroviax run offline or in-memory without a local MongoDB installation?',
        a: 'Yes! For rapid developer onboarding and offline demonstration, the backend features an in-memory database fallback that initializes with pre-seeded products, branches, and sample transactions automatically.',
      },
    ],
  },
  {
    title: 'AI Assistants & Human Safety Gates',
    items: [
      {
        q: 'Will the AI assistants spend money or order stock without my permission?',
        a: 'Never. Safety and governance are the core of our platform architecture. All high-value operations—such as generating supplier purchase orders or sending promotional broadcasts—are categorized by risk tier (Low, Medium, High) and held in an approval queue until an authorized manager or owner approves them.',
      },
      {
        q: 'How does the Phase 3 Procurement Assistant calculate reorder recommendations?',
        a: 'The Procurement Assistant calculates current stock levels, safety stock reorder thresholds, and recent sales depletion velocity. If projected stockout is detected within supplier lead times, it compares quotes across your registered suppliers and drafts an optimal PO.',
      },
      {
        q: 'What are the 6 specialized AI domain assistants?',
        a: 'Neuroviax features 6 specialized copilots: (1) Sales, (2) Procurement, (3) Inventory, (4) Marketing, (5) Customer Support, and (6) Finance & Cash Flow.',
      },
    ],
  },
  {
    title: 'Emerging Markets & WhatsApp Integration',
    items: [
      {
        q: 'Is Neuroviax AI optimized for Pakistan, India, and MENA business realities?',
        a: 'Yes. Neuroviax natively supports PKR, INR, AED, and USD currencies, multi-warehouse location tracking, manual and digital cash-on-delivery (COD) reconciliation, and direct WhatsApp customer communication.',
      },
      {
        q: 'How does the WhatsApp Business integration work?',
        a: 'You can connect your WhatsApp business account to automatically send order receipts, low-stock manager alerts, payment confirmation links, and customer service draft responses right inside the conversation thread.',
      },
    ],
  },
  {
    title: 'Billing, Plans & Security',
    items: [
      {
        q: 'How does the Free Starter Tier work?',
        a: 'Our Free Starter Tier allows solo owners and small shops to track up to 250 SKUs across 1 physical branch with full access to POS checkout, stock movement logs, and basic reporting without requiring a credit card.',
      },
      {
        q: 'What payment methods are supported for subscriptions?',
        a: 'We process subscription billing securely via Stripe (Visa, MasterCard, Amex) and provide customer portal access to download past VAT invoices or upgrade your plan at any time.',
      },
      {
        q: 'How is our business data protected?',
        a: 'We implement strict multi-tenant isolation, 256-bit encryption in transit and at rest, JWT access and refresh tokens, bcrypt password hashing, immutable audit logging, and helmet security headers.',
      },
    ],
  },
];

export const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({ '0-0': true });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      <SEO
        title="Frequently Asked Questions (FAQ) — Neuroviax AI"
        description="Find answers to common questions about Neuroviax ABOP, the 6 AI assistants, human-in-the-loop safety, WhatsApp integration, and pricing."
      />

      <LandingNavbar />

      {/* Ambient background glow */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Knowledge Base & Support</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-6">
          Frequently Asked <br />
          <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Questions
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Everything you need to know about autonomous business operations, domain AI copilots, safety safeguards, and onboarding.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g., WhatsApp, safety, pricing, loop)..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
          />
        </div>
      </section>

      {/* Accordion Categories */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-10">
        {filteredCategories.map((category, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider px-2">
              {category.title}
            </h3>

            <div className="space-y-3">
              {category.items.map((item, itemIdx) => {
                const key = `${catIdx}-${itemIdx}`;
                const isOpen = !!openItems[key];
                return (
                  <div
                    key={key}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-colors hover:border-slate-700"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-400' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 sm:px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
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
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No matching questions found for "{searchQuery}". Please reach out to our team directly!
          </div>
        )}

        {/* Still Have Questions Box */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-white">Still have questions?</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our platform engineers and solutions architects are ready to assist you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition"
            >
              Contact Support
            </Link>
            <a
              href="https://wa.me/923264414694?text=Hi%20Neuroviax%20AI!%20I%20have%20a%20question%20about%20the%20platform."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default FAQPage;
