import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Star,
  MessageCircle,
  Bot,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  Layers,
  Scale,
  CreditCard,
  HelpCircle,
  Info,
} from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white border-t border-slate-800/80">
      {/* ── FINAL CTA BANNER ────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/50 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/20">
                <Sparkles className="w-6 h-6 text-emerald-950" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-3">
                Ready to Autonomize Your Business?
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-lg mx-auto leading-relaxed">
                Join the AI-first revolution. Deploy your ABOP workspace in minutes and let specialized copilots run analysis while you retain complete approval control.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Star className="w-4 h-4" />
                    <span>Launch Your Free ABOP Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
                <a
                  href="https://wa.me/923264414694?text=Hi%20Neuroviax%20AI!%20I%20would%20like%20to%20inquire%20about%20your%20platform."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/30"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp: 03264414694</span>
                  </motion.div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER DIRECTORY ────────────────────────────── */}
      <footer className="border-t border-slate-800/80 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 border border-slate-700 shadow-md">
                <img src="/logo.png" alt="Neuroviax AI Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="text-sm font-black text-white">Neuroviax AI</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The autonomous ERP operating engine replacing manual coordination with synchronized domain AI copilots.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Emerging Markets (PK, IN, MENA)</span>
            </div>
          </div>

          {/* Platform Pages */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/architecture" className="hover:text-emerald-400 transition">System Architecture</Link>
              </li>
              <li>
                <Link to="/assistants" className="hover:text-emerald-400 transition">6 AI Assistants</Link>
              </li>
              <li>
                <Link to="/abop-loop" className="hover:text-emerald-400 transition">ABOP Closed Loop</Link>
              </li>
              <li>
                <Link to="/differentiator" className="hover:text-emerald-400 transition">30/70 Differentiator</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-emerald-400 transition">Pricing & Plans</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">About Our Architecture</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition">Contact & Support</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">Customer Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Contact Direct</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+92 326 4414694</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>muzammal@neuroviax.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Platform Creator: Muzammal Nazir</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Neuroviax AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300 transition">Privacy & Compliance</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300 transition">SLA Terms</Link>
            <span>•</span>
            <Link to="/faq" className="hover:text-slate-300 transition">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingFooter;
