import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
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
} from 'lucide-react';
import api from '../api/axios';

interface ActionItem {
  label: string;
  path: string;
  variant?: 'primary' | 'secondary';
  icon?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: ActionItem[];
  timestamp: string;
  isUrdu?: boolean;
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
  { id: 'abop', name: 'Master ABOP', icon: Zap, color: 'from-indigo-500 to-purple-600' },
  { id: 'inventory', name: 'Inventory AI', icon: Package, color: 'from-amber-500 to-orange-500' },
  { id: 'sales', name: 'Sales & CRM', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  { id: 'finance', name: 'Finance AI', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
];

const INITIAL_GREETING: ChatMessage = {
  id: 'init-msg',
  sender: 'ai',
  text: `👋 Assalam-o-Alaikum & Welcome! I am your **Neuroviax AI Copilot** — your real-time autonomous operating engine.\n\nAsk me anything in **English** or **Roman Urdu** about:\n• 📦 **Stock & Reorders** (*"stock kitna bacha hai?"*)\n• 💰 **Sales & Revenue** (*"today's earnings & orders"*)\n• 📱 **WhatsApp CRM** (*"whatsapp opt-in status"*)\n• 🛡️ **Risk & Anomaly Guard** (*"koi risk alert hai?"*)\n• 💎 **Subscription Plans** (*"compare packages"*)`,
  actions: [
    { label: '🚨 Check Low Stock', path: '/inventory', variant: 'primary' },
    { label: '💰 Today\'s Revenue', path: '/orders', variant: 'secondary' },
    { label: '📱 WhatsApp Leads', path: '/customers' },
    { label: '💎 View Pricing Plans', path: '/pricing' },
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const AIChatCopilot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('neuroviax_copilot_chat');
      return saved ? JSON.parse(saved) : [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState('abop');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [stats, setStats] = useState<CopilotStats | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('neuroviax_copilot_chat', JSON.stringify(messages));
    } catch {
      // Ignore quota error
    }
  }, [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Fetch quick stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/ai/copilot/stats');
        setStats(data);
      } catch {
        // Fallback default
        setStats({
          isLoggedIn: false,
          lowStockCount: 3,
          whatsappOptIns: 12,
          pendingOrders: 2,
          activeAnomalies: 1,
          totalRevenue: 24500,
        });
      }
    };
    fetchStats();
  }, [location.pathname]);

  // Auto-hide teaser tooltip after 8s
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut: Ctrl + Space or Alt + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.code === 'Space') || (e.altKey && e.code === 'KeyK')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Speak AI text via Web Speech API
  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown symbols for cleaner voice
      const clean = text.replace(/[*#_`]/g, '').replace(/•/g, ', ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech failed silently
    }
  };

  const handleSend = async (customMessage?: string) => {
    const query = (customMessage || input).trim();
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
        contextPath: location.pathname,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        actions: data.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUrdu: data.isUrdu,
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

  const handleClear = () => {
    setMessages([INITIAL_GREETING]);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    // If mobile viewport, minimize on click
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ── Floating Activator Button (Bottom-6 Right-6) ── */}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2.5">
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(true)}
              className="cursor-pointer bg-slate-900/90 backdrop-blur-md text-white border border-indigo-500/30 px-3.5 py-2 rounded-2xl shadow-xl shadow-indigo-950/40 flex items-center gap-2 max-w-[240px] hover:border-indigo-400 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5">
                  AI Copilot Online
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Ask stock, sales or Urdu guide!
                </p>
              </div>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Copilot"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative group w-[58px] h-[58px] rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[2px] shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center justify-center"
        >
          {/* Animated glow ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 animate-pulse opacity-75 blur-sm" />

          {/* Button face */}
          <div className="relative w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 group-hover:opacity-100 transition-opacity" />
            {isOpen ? (
              <X className="w-6 h-6 text-white relative z-10 transition-transform group-hover:rotate-90 duration-200" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="w-6 h-6 text-indigo-300 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* ── Main Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed z-[9999] bottom-6 right-6 ${
              isExpanded
                ? 'w-[calc(100vw-32px)] sm:w-[680px] h-[85vh] max-h-[850px]'
                : 'w-[calc(100vw-32px)] sm:w-[430px] h-[580px] max-h-[90vh]'
            } bg-slate-950/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* ── Header ── */}
            <div className="relative px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-indigo-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-[1px] flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-tight">Neuroviax AI Copilot</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      v2.5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ABOP Autonomous Engine
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {/* TTS Voice Toggle */}
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Speech Output'}
                  className={`p-1.5 rounded-lg border transition-all ${
                    ttsEnabled
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Clear Chat */}
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Open Full Chatboard Page */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/chatboard');
                  }}
                  title="Open Full AI Executive Chatboard"
                  className="px-2 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Full Board</span>
                </button>

                {/* Expand / Minimize */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore size' : 'Expand window'}
                  className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Copilot"
                  className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Persona Switcher Pills ── */}
            <div className="px-3.5 py-2 bg-slate-900/60 border-b border-indigo-500/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const active = activePersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePersona(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* ── Real-Time Metrics Bar (If Available) ── */}
            {stats && (
              <div className="px-3 py-1.5 bg-indigo-950/40 border-b border-indigo-500/15 flex items-center justify-between text-[11px] shrink-0 text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Low Stock:{' '}
                  <strong className="text-amber-300 font-mono font-bold">
                    {stats.lowStockCount}
                  </strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  WhatsApp Opt-in:{' '}
                  <strong className="text-emerald-300 font-mono font-bold">
                    {stats.whatsappOptIns}
                  </strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Revenue:{' '}
                  <strong className="text-cyan-300 font-mono font-bold">
                    ${(stats.totalRevenue || 0).toLocaleString()}
                  </strong>
                </span>
              </div>
            )}

            {/* ── Message Thread ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-sm scroll-smooth">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {msg.sender === 'user' ? 'You' : 'Neuroviax AI'}
                    </span>
                    <span className="text-[9px] text-slate-600">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Message Body with markdown simulation */}
                    <div className="leading-relaxed whitespace-pre-wrap font-sans text-[13px]">
                      {msg.text.split('\n').map((line, idx) => {
                        // Bold parsing
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={idx} className={line.startsWith('•') ? 'pl-2 text-slate-300 my-0.5' : 'my-1'}>
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
                          </p>
                        );
                      })}
                    </div>

                    {/* Interactive Clickable Actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => handleActionClick(act.path)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              act.variant === 'primary'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                            }`}
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3 shrink-0 opacity-80" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs px-2 py-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  </div>
                  <span>Neuroviax AI is analyzing live business metrics...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Action Pills (Interactive Prompts) ── */}
            <div className="px-3 py-2 bg-slate-900/90 border-t border-indigo-500/10 shrink-0">
              <div className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Quick Prompts:
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => handleSend('stock kitna bacha hai aur konsa item low hai?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-amber-500/20 whitespace-nowrap transition-colors"
                >
                  🚨 Low Stock SKUs
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('today revenue, orders and cash flow status?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium border border-cyan-500/20 whitespace-nowrap transition-colors"
                >
                  💰 Today's Revenue
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('whatsapp opt-in customers status aur campaigns?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-medium border border-emerald-500/20 whitespace-nowrap transition-colors"
                >
                  📱 WhatsApp CRM
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('compare starter, pro, and enterprise packages')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-medium border border-purple-500/20 whitespace-nowrap transition-colors"
                >
                  💎 Plans & Pricing
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('abop loop kaise kaam karta hai aur 6 assistants ka kya faida hai?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium border border-indigo-500/20 whitespace-nowrap transition-colors"
                >
                  ⚡ ABOP Loop Guide
                </button>
              </div>
            </div>

            {/* ── Input Bar ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-900 border-t border-indigo-500/20 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask in English or Urdu: 'kitna stock hai?', 'orders'..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send Message"
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatCopilot;
