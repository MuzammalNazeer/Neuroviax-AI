import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Trash2,
  Package,
  TrendingUp,
  MessageCircle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Loader2,
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  Briefcase,
  Copy,
  Check,
  PhoneCall,
  Store,
  DollarSign,
  Scale
} from 'lucide-react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingFooter } from '../components/LandingFooter';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface ActionItem {
  label: string;
  path: string;
  variant?: 'primary' | 'secondary';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: ActionItem[];
  timestamp: string;
  isUrdu?: boolean;
  persona?: string;
}

interface CopilotStats {
  isLoggedIn: boolean;
  lowStockCount: number;
  whatsappOptIns: number;
  pendingOrders: number;
  activeAnomalies: number;
  totalRevenue: number;
  businessName?: string;
}

const PERSONAS = [
  {
    id: 'abop',
    name: 'Master ABOP Copilot',
    role: 'Autonomous Business Engine',
    icon: Zap,
    color: 'from-indigo-500 via-purple-600 to-indigo-700',
    description: 'Autonomous closed-loop orchestration across all store operations',
  },
  {
    id: 'inventory',
    name: 'Inventory & Procurement AI',
    role: 'Stockout & EOQ Guardian',
    icon: Package,
    color: 'from-amber-500 via-orange-600 to-amber-700',
    description: 'Demand forecasting, low stock alerts, and automated purchase orders',
  },
  {
    id: 'sales',
    name: 'Sales & WhatsApp CRM',
    role: 'Revenue Growth Engine',
    icon: TrendingUp,
    color: 'from-emerald-500 via-teal-600 to-emerald-700',
    description: 'Direct WhatsApp customer outreach, cart recovery, and order analytics',
  },
  {
    id: 'finance',
    name: 'Financial Intelligence AI',
    role: 'Cash Flow & Ledger Auditor',
    icon: DollarSign,
    color: 'from-blue-500 via-cyan-600 to-blue-700',
    description: '14-day cash-flow runway, payments tracking, and profit margins',
  },
  {
    id: 'risk',
    name: 'Anomaly & Risk Sentinel',
    role: 'Isolation Forest Shield',
    icon: ShieldAlert,
    color: 'from-rose-500 via-red-600 to-rose-700',
    description: 'Loss prevention, suspicious discounts, and fraudulent order traps',
  },
  {
    id: 'advisor',
    name: 'Store Setup & ROI Advisor',
    role: 'Package & Business Consultant',
    icon: Store,
    color: 'from-violet-500 via-fuchsia-600 to-pink-600',
    description: 'Guidance for groceries, pharmacies, retail brands, and multi-branches',
  },
];

const SUGGESTED_QUERIES = [
  {
    category: '🚨 Stock & Inventory',
    prompts: [
      'Kaunse products ka stock khatam hone wala hai?',
      'Check inventory health and reorder thresholds',
      'How does machine learning demand forecasting work?',
    ],
  },
  {
    category: '💰 Sales & Profit',
    prompts: [
      'Today sales, pending orders aur cash flow status?',
      'Compare our revenue vs last week projections',
      'What is our Average Order Value (AOV)?',
    ],
  },
  {
    category: '📱 WhatsApp Marketing',
    prompts: [
      'WhatsApp opt-in customers status aur campaigns?',
      'How to send order tracking directly on WhatsApp?',
      'Recover abandoned checkouts via WhatsApp',
    ],
  },
  {
    category: '🏪 Business & Pricing Advisor',
    prompts: [
      'Grocery / Retail store ke liye konsa package best hai?',
      'Compare starter, pro, and enterprise packages',
      'Why choose Neuroviax instead of SAP, Zoho, or Odoo?',
      'Book a live interactive demo with WhatsApp consultation',
    ],
  },
];

const INITIAL_GREETING: ChatMessage = {
  id: 'board-init-msg',
  sender: 'ai',
  text: `👋 **Assalam-o-Alaikum & Welcome to the Neuroviax AI Executive Chatboard!**\n\nI am your centralized **Autonomous Business Operating Platform (ABOP)** intelligence officer. Whether you run a retail shop, grocery mart, pharmacy, or enterprise multi-branch franchise, I can assist you instantly in **English** or **Roman Urdu**.\n\n### ⚡ How I can help your business today:\n• 📦 **Stock Audit:** Detect critical shortages before stockouts occur.\n• 💰 **Revenue Pulse:** Real-time earnings, cash-flow projection, and ledger sanity.\n• 📱 **WhatsApp CRM:** Automated campaigns for verified opt-in buyers.\n• 🛡️ **Risk Guard:** Isolation Forest fraud and suspicious price detection.\n• 🏪 **Plan Selection:** Find the exact software package tailored for your exact store size.\n\nChoose an executive prompt below or type your inquiry to get started!`,
  actions: [
    { label: '🚨 Check Low Stock SKUs', path: '/inventory', variant: 'primary' },
    { label: '💰 Today\'s Revenue', path: '/orders', variant: 'secondary' },
    { label: '💎 Compare Pricing Plans', path: '/pricing' },
    { label: '🔄 View ABOP Loop', path: '/abop-loop' },
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  persona: 'abop',
};

const AIChatboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activePersona, setActivePersona] = useState('abop');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('neuroviax_executive_chatboard');
      return saved ? JSON.parse(saved) : [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [stats, setStats] = useState<CopilotStats | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('neuroviax_executive_chatboard', JSON.stringify(messages));
    } catch {
      // Ignore quota
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/ai/copilot/stats');
        setStats(data);
      } catch {
        setStats({
          isLoggedIn: !!user,
          lowStockCount: 3,
          whatsappOptIns: 12,
          pendingOrders: 2,
          activeAnomalies: 1,
          totalRevenue: 24500,
          businessName: 'Neuroviax AI Live Demo',
        });
      }
    };
    fetchStats();
  }, [user]);

  // Web Speech API Voice
  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`]/g, '').replace(/•/g, ', ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech failed silently
    }
  };

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/copilot/chat', {
        message: query,
        persona: activePersona,
        contextPath: '/chatboard',
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        actions: data.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUrdu: data.isUrdu,
        persona: activePersona,
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(data.reply);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '⚠️ I encountered a temporary connection issue. Please verify backend server is active or retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([INITIAL_GREETING]);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const currentPersonaObj = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <SEO
        title="AI Chatboard & Executive Copilot — Neuroviax AI"
        description="Interact with the Neuroviax AI Autonomous Business Operating Copilot. Real-time stock audit, revenue pulse, WhatsApp CRM automation, and package consultation in English and Urdu."
      />

      <LandingNavbar />

      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col">
        {/* Top Header Badge */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Enterprise Copilot
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Neuroviax AI Chatboard
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                Live ABOP v2.5
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Ask anything in English or Roman Urdu to run inventory audits, track revenues, launch WhatsApp CRM, or compare business software tiers.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          {stats && (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-2.5 shadow-lg backdrop-blur-md">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Low Stock</span>
                <span className="text-sm font-bold font-mono text-amber-400">{stats.lowStockCount} SKUs</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">WhatsApp Leads</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{stats.whatsappOptIns} Opted</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Gross Revenue</span>
                <span className="text-sm font-bold font-mono text-cyan-400">${stats.totalRevenue.toLocaleString()}</span>
              </div>
              {user && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  ERP Portal
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* ── Left Sidebar (Assistants & Queries) ── */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Persona Switcher Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                Select AI Assistant Mode
              </h2>
              <div className="space-y-2">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const isActive = activePersona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePersona(p.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                        isActive
                          ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                          : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} p-[1px] flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        <div className="w-full h-full bg-slate-950/80 rounded-[11px] flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {p.name}
                          </p>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">
                          {p.role}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggested Inquiries Accordion Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Executive Quick Prompts
              </h2>
              <div className="space-y-3">
                {SUGGESTED_QUERIES.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      {group.category}
                    </p>
                    <div className="space-y-1">
                      {group.prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left text-[11px] py-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all flex items-center justify-between group"
                        >
                          <span className="truncate">{prompt}</span>
                          <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Chat Stream & Input Area ── */}
          <div className="lg:col-span-8 flex flex-col bg-slate-900/80 border border-indigo-500/20 rounded-3xl shadow-2xl overflow-hidden min-h-[650px] max-h-[820px] backdrop-blur-xl">
            {/* Chat Board Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentPersonaObj.color} p-[1px] flex items-center justify-center shadow-md`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                    <currentPersonaObj.icon className="w-5 h-5 text-indigo-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {currentPersonaObj.name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentPersonaObj.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Voice Speech Toggle */}
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice Synthesis'}
                  className={`p-2 rounded-xl border transition-all ${
                    ttsEnabled
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Reset Conversation */}
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation history"
                  className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender metadata label */}
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      {msg.sender === 'user' ? (
                        'You'
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Neuroviax Copilot</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.text, index)}
                      title="Copy response"
                      className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[90%] sm:max-w-[82%] rounded-2xl px-5 py-4 shadow-xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-tr-none'
                        : 'bg-slate-950/90 border border-slate-800/90 text-slate-100 rounded-tl-none shadow-black/40'
                    }`}
                  >
                    {/* Parsed Body */}
                    <div className="leading-relaxed whitespace-pre-wrap font-sans text-sm">
                      {msg.text.split('\n').map((line, lIdx) => {
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div
                            key={lIdx}
                            className={
                              line.startsWith('###')
                                ? 'text-indigo-300 font-bold text-base mt-2 mb-1'
                                : line.startsWith('•')
                                ? 'pl-2 text-slate-300 my-1'
                                : 'my-1'
                            }
                          >
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={pIdx} className="text-white font-bold">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => navigate(act.path)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              act.variant === 'primary'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                            }`}
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-3 text-slate-400 text-xs px-2 py-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">Neuroviax ABOP Engine is calculating...</span>
                    <span className="text-[11px] text-slate-500">Cross-referencing telemetry, XGBoost forecasts & isolation models</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar Form */}
            <div className="p-4 bg-slate-950/90 border-t border-indigo-500/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask stock, sales, WhatsApp campaigns, package recommendation or advice..."
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Supports plain English & Roman Urdu • Real-time database telemetry synced</span>
                <span className="hidden sm:inline">Press Enter ↵ to send</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default AIChatboardPage;
