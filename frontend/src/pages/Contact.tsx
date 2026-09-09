import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Headphones,
  Building,
  CreditCard,
  Loader2,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

const FAQ_ITEMS = [
  {
    q: 'How fast will your team respond to my support ticket?',
    a: 'Free Starter accounts receive email support within 24 hours. Basic and Pro subscribers receive priority routing with guaranteed responses under 2 hours (24/7 for critical incidents).',
  },
  {
    q: 'Can I request custom enterprise integrations (ERP, Oracle, SAP)?',
    a: 'Yes. Our solutions architecture team designs bespoke data connectors, Qdrant/Weaviate vector indexes, and custom regional ERP data pipelines for Enterprise clients.',
  },
  {
    q: 'Where can I manage my Stripe billing and invoices?',
    a: 'You can view, update, and download all past VAT invoices anytime via the Subscription Management page or Stripe Customer Portal.',
  },
];

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    category: 'Sales & Subscriptions',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/contact', formData);
      const generatedId = res.data?.ticketId || `NVX-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedId);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setError(
        err.response?.data?.message || 'Unable to submit ticket at this moment. Please reach us via WhatsApp directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <SEO
        title="Contact Neuroviax AI — 24/7 Customer & Legal Support"
        description="Connect with Neuroviax AI support, enterprise sales, technical specialists, and partnership directors. Guaranteed SLA response times."
      />

      {/* Header */}
      <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5" />
          Get in Touch
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          We’re Here to Accelerate <br className="hidden sm:inline" />
          Your Business Operations
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Whether you have questions about our autonomous AI modules, Stripe subscription plans, or need dedicated enterprise onboarding, our team is ready.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Info */}
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-400" />
                Direct Communication Channels
              </h3>

              <div className="space-y-4 text-sm text-slate-300">
                {/* WhatsApp Official Direct Channel */}
                <a
                  href="https://wa.me/923264414694?text=Hi%20Neuroviax%20AI%20Support!%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-950/70 to-slate-900/70 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group block"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400 uppercase font-black tracking-wider block">
                        Official WhatsApp Support
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Online 24/7
                      </span>
                    </div>
                    <p className="font-bold text-base text-white group-hover:text-emerald-300 transition mt-1">
                      03264414694 (+92 326 4414694)
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Click to chat directly on WhatsApp — Instant response</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Self-Service Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/subscription/plans')}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left hover:border-indigo-500/40 transition group"
                >
                  <CreditCard className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-xs font-semibold text-white block group-hover:text-indigo-300">
                    Pricing Plans
                  </span>
                  <span className="text-[10px] text-slate-400">Monthly & Annual</span>
                </button>
                <button
                  onClick={() => navigate('/subscription/management')}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left hover:border-indigo-500/40 transition group"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-xs font-semibold text-white block group-hover:text-emerald-300">
                    Billing Portal
                  </span>
                  <span className="text-[10px] text-slate-400">Invoices & Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl relative">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-white">Send Us a Direct Message</h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Fill in your details below and our operations specialist will reply promptly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Sarah Jenkins"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="sarah@lawgroup.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Phone / WhatsApp (Optional)
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 019-2834"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Department / Topic
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                        >
                          <option value="Sales & Subscriptions">Sales & Subscriptions</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Lawyer Marketplace">Lawyer Marketplace & Escrow</option>
                          <option value="Enterprise Custom SLA">Enterprise Custom SLA</option>
                          <option value="Billing & Invoicing">Billing & Invoicing</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Inquiry regarding Pro Tier AI contract auditing..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Detailed Message *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe your requirements, team size, or questions..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                        <span>⚠️ {error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>

                    <div className="relative flex items-center justify-center pt-1">
                      <div className="border-t border-slate-800 w-full" />
                      <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-bold tracking-wider absolute">
                        or direct message
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/923264414694?text=${encodeURIComponent(
                        formData.message 
                          ? `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\n${formData.message}`
                          : 'Hi Neuroviax AI, I need assistance with your platform.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-6 rounded-xl font-semibold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp directly: 03264414694</span>
                    </a>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Neuroviax AI. Your ticket has been logged in our priority queue with reference{' '}
                      <strong className="text-emerald-400 font-mono">{ticketId}</strong>.
                    </p>
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-md mx-auto text-xs text-slate-300 space-y-1 text-left">
                      <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span>✉️ Real-Time Notification Sent</span>
                      </p>
                      <p className="text-slate-400">
                        An instant notification with your details has been dispatched to{' '}
                        <span className="text-white font-medium">nazirmuzammal28@gmail.com</span> and a confirmation receipt has been sent to{' '}
                        <span className="text-white font-medium">{formData.email}</span>.
                      </p>
                    </div>

                    <div className="pt-4 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({ ...formData, subject: '', message: '' });
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
                      >
                        Send Another Message
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mt-20 pt-12 border-t border-slate-900">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">FAQ</span>
            <h3 className="text-2xl font-bold text-white">Common Inquiries</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item.q}</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
