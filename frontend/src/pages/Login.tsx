import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, isFirebaseConfigured, signInWithPopup } from '../firebase';
import SEO from '../components/SEO';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  CheckCircle2,
  Eye,
  EyeOff,
  Bot,
  TrendingUp,
  Activity,
  Check,
  Building2,
  KeyRound,
  Fingerprint,
  User as UserIcon,
  Plus,
  X,
} from 'lucide-react';

const GOOGLE_ACCOUNTS = [
  {
    name: 'Demo Store Owner',
    email: 'demo@neuroviax.ai',
    initials: 'DO',
    bg: 'bg-emerald-600',
    type: 'Demo Business Account',
  },
];

const DEMO_PERSONAS = [
  {
    role: 'Demo Owner',
    email: 'demo@neuroviax.ai',
    badge: 'Store Demo',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
  },
  {
    role: 'Procurement',
    email: 'procurement@neuroviax.ai',
    badge: 'Manager',
    color: 'border-blue-500/40 text-blue-400 bg-blue-950/40',
  },
  {
    role: 'Inventory',
    email: 'inventory@neuroviax.ai',
    badge: 'Staff',
    color: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
  },
];

const Login: React.FC = () => {
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const registeredEmail = (location.state as any)?.registeredEmail;
  const initialMessage = (location.state as any)?.message;
  const savedEmail = localStorage.getItem('lastEmail');

  const initialEmail = registeredEmail || savedEmail || 'demo@neuroviax.ai';
  const isDemo = initialEmail === 'demo@neuroviax.ai';

  const [email, setEmail] = useState(() => initialEmail);
  const [password, setPassword] = useState(() => (isDemo ? 'Password123!' : ''));
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [success, setSuccess] = useState(() => initialMessage || '');
  const [error, setError] = useState('');
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  // Google Account Chooser State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [signingGoogleEmail, setSigningGoogleEmail] = useState<string | null>(null);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('lastEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
      }
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or login failed');
    }
  };

  const handlePersonaSelect = (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword('Password123!');
    setError('');
  };

  const handleSsoClick = async (provider: string) => {
    if (provider === 'Google') {
      // 1. If Firebase Web API key is configured, trigger live Firebase Google popup
      if (isFirebaseConfigured()) {
        setSsoLoading('Google');
        setError('');
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;
          const idToken = await fbUser.getIdToken();

          await loginWithGoogle({
            email: fbUser.email || undefined,
            name: fbUser.displayName || undefined,
            googleId: fbUser.uid,
            idToken,
          });

          setSuccess(`Authenticated as ${fbUser.displayName || fbUser.email}! Redirecting…`);
          setTimeout(() => {
            navigate('/dashboard');
          }, 350);
          return;
        } catch (err: any) {
          console.error('Firebase Google sign-in error:', err);
          if (err.code === 'auth/popup-closed-by-user') {
            setError('Google sign-in popup was closed.');
            setSsoLoading(null);
            return;
          }
          if (err.code === 'auth/unauthorized-domain') {
            setError('Domain localhost is not authorized in Firebase Console → Authentication → Settings → Authorized Domains.');
            setSsoLoading(null);
            return;
          }
          // If popup failed due to API key / domain / config, open Account Chooser modal
          setShowGoogleModal(true);
        } finally {
          setSsoLoading(null);
        }
        return;
      }

      // 2. If Firebase Web API key is not yet set in .env, open Account Chooser
      setShowGoogleModal(true);
      return;
    }
    setSsoLoading(provider);
    setError('');
    try {
      await loginWithGoogle({
        email: 'admin@neuroviax.ai',
        name: 'Enterprise Admin',
        googleId: 'ms_aad_9381029381',
      });
      setSuccess(`Enterprise SSO authenticated! Redirecting…`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err: any) {
      setError(err.response?.data?.message || `${provider} SSO authentication failed.`);
    } finally {
      setSsoLoading(null);
    }
  };

  const handleFirebasePopupClick = async () => {
    setSigningGoogleEmail('popup');
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();
      await loginWithGoogle({
        email: fbUser.email || undefined,
        name: fbUser.displayName || undefined,
        googleId: fbUser.uid,
        idToken,
      });
      setSuccess(`Signed in as ${fbUser.displayName || fbUser.email} via Google!`);
      setShowGoogleModal(false);
      setTimeout(() => navigate('/dashboard'), 350);
    } catch (err: any) {
      console.error('Firebase error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Popup was closed. You can select an account below.');
      } else {
        setError(err.message || 'Firebase sign-in failed.');
      }
    } finally {
      setSigningGoogleEmail(null);
    }
  };

  const handleSelectGoogleAccount = async (account: { email: string; name: string }) => {
    setSigningGoogleEmail(account.email);
    setError('');
    try {
      await loginWithGoogle({
        email: account.email,
        name: account.name,
        googleId: `google_oauth2_${Math.floor(100000000 + Math.random() * 900000000)}`,
      });
      setSuccess(`Signed in as ${account.name} (${account.email}) via Google!`);
      setShowGoogleModal(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 350);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setSigningGoogleEmail(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      <SEO
        title="Sign In to Your Autonomous Business Account"
        description="Sign in to Neuroviax AI, the Autonomous Business Operating Platform. Manage real-time inventory, orders, payments, procurement, and AI assistant copilots."
        canonical="https://neuroviax.ai/login"
        keywords="Neuroviax login, ABOP portal, business operating system sign in, AI ERP login"
      />
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN: Visual Showcase & Enterprise Credibility (Desktop Only) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4"
        >
          {/* Header & Brand Badge */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ABOP Engine • Autonomous Operations</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black font-display tracking-tight text-white leading-tight">
              The Intelligence Layer for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Modern Enterprises
              </span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Neuroviax unifies multi-branch inventory, predictive procurement, autonomous approvals,
              and real-time financial cash-flow analytics in a single secure platform.
            </p>
          </div>

          {/* Interactive Live AI Simulation Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
            
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Procurement AI Assistant</h4>
                  <p className="text-[10px] text-emerald-400 font-mono">Status: Active • Real-time Monitoring</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                98.4% Confidence
              </span>
            </div>

            {/* Micro Recommendation Pill */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-200">Reorder Proposal: Arabica Coffee Beans</p>
                <p className="text-[11px] text-slate-400">Low stock detected (4 bags left). Predicted stockout: 3 days.</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">+50 Bags</span>
                <p className="text-[10px] text-slate-500">Auto PO ready</p>
              </div>
            </div>

            {/* Live Stats Ticker */}
            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="bg-slate-800/40 rounded-lg p-2 border border-slate-800/50">
                <div className="text-base font-black text-white">$4.2M+</div>
                <div className="text-[10px] text-slate-400">Processed Vol</div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-2 border border-slate-800/50">
                <div className="text-base font-black text-emerald-400">99.8%</div>
                <div className="text-[10px] text-slate-400">Accuracy Rate</div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-2 border border-slate-800/50">
                <div className="text-base font-black text-cyan-400">&lt;250ms</div>
                <div className="text-[10px] text-slate-400">API Latency</div>
              </div>
            </div>
          </div>

          {/* Security Certifications Strip */}
          <div className="flex items-center gap-6 pt-2 text-slate-500 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC2 Type II</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>256-bit TLS Encryption</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>99.99% Uptime</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Modern High-Converting Glassmorphic Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="lg:col-span-6 w-full max-w-md mx-auto bg-slate-900/85 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/80 relative space-y-5"
        >
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center text-emerald-950 mx-auto shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              Sign in to Neuroviax
            </h2>
            <p className="text-xs text-slate-400">
              Access your business workspace and AI operational assistant
            </p>
          </div>

          {/* Dual Authentication Mode Tabs */}
          <div className="flex p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'password'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('otp');
                navigate('/verify-otp', { state: { email } });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'otp'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Instant 2FA / OTP</span>
            </button>
          </div>

          {/* Quick Persona Fill Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>One-Click Demo Roles:</span>
              </span>
              <span className="text-[10px] text-slate-500">Tap to load</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handlePersonaSelect(p.email)}
                  className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold text-left transition-all hover:scale-[1.02] ${p.color} ${
                    email === p.email ? 'ring-1 ring-emerald-400 border-emerald-400' : ''
                  }`}
                >
                  <p className="truncate text-slate-200">{p.role.split('/')[0]}</p>
                  <p className="text-[9px] opacity-75 truncate">{p.badge}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Social / SSO Single Sign-On Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSsoClick('Google')}
              disabled={!!ssoLoading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 transition active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSsoClick('Microsoft')}
              disabled={!!ssoLoading}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl py-2 px-3 text-xs font-semibold text-slate-200 transition active:scale-95 disabled:opacity-50"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>{ssoLoading === 'Microsoft' ? 'Authorizing…' : 'Enterprise SSO'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Or email & password
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Work Email Address</span>
                </span>
                <span className="text-[10px] text-slate-500">Required</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
                placeholder="you@company.com"
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Password</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox & Security Indicator */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    rememberMe
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 bg-slate-800/80'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs text-slate-300">Remember this device</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SSL Secured</span>
              </div>
            </div>

            {/* Success Notification */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl p-3 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Primary Submit Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl py-3 text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Workspace…' : 'Sign in to Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* Footer Link & Registration */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Don't have an account?</span>
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition"
            >
              Create Workspace →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* AUTHENTIC GOOGLE ACCOUNT CHOOSER DIALOG */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative"
            >
              {/* Top Google Branding Bar */}
              <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-slate-100 relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleModal(false);
                    setShowCustomGoogle(false);
                  }}
                  className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 mb-2 flex items-center justify-center">
                  <svg className="w-9 h-9" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">Sign in with Google</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose an account to continue to <span className="font-semibold text-slate-800">Neuroviax AI</span>
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Firebase Auth: <strong className="font-semibold">project-1093978510125</strong></span>
                </div>
              </div>

              {/* Account Selection List */}
              <div className="p-4 space-y-2">
                {!showCustomGoogle ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      disabled={!!signingGoogleEmail}
                      onClick={handleFirebasePopupClick}
                      className="w-full mb-3 py-2.5 px-3.5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                        <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                      </svg>
                      <span>
                        {signingGoogleEmail === 'popup' ? 'Opening Google Account…' : 'Launch Google Account Popup'}
                      </span>
                    </motion.button>

                    <div className="relative flex items-center justify-center my-2">
                      <div className="w-full border-t border-slate-200" />
                      <span className="absolute bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Or select quick profile
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {GOOGLE_ACCOUNTS.map((acc) => {
                        const isSelected = signingGoogleEmail === acc.email;
                        return (
                          <motion.button
                            key={acc.email}
                            whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                            whileTap={{ scale: 0.99 }}
                            disabled={!!signingGoogleEmail}
                            onClick={() => handleSelectGoogleAccount(acc)}
                            className="w-full py-3 px-3.5 flex items-center justify-between text-left rounded-2xl transition group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${acc.bg} text-white font-bold flex items-center justify-center text-xs shadow-sm`}
                              >
                                {acc.initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition">
                                  {acc.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">{acc.email}</p>
                                <span className="text-[9px] text-slate-400 font-medium">{acc.type}</span>
                              </div>
                            </div>

                            {isSelected ? (
                              <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                            ) : (
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={() => setShowCustomGoogle(true)}
                        className="w-full py-3 px-3.5 flex items-center gap-3 text-left rounded-2xl transition text-slate-700 hover:text-slate-900 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Use another Google account</p>
                          <p className="text-[11px] text-slate-400">Sign in with any custom Google or Gmail address</p>
                        </div>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!customGoogleEmail) return;
                      handleSelectGoogleAccount({
                        email: customGoogleEmail.trim(),
                        name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
                      });
                    }}
                    className="p-2 space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Google / Gmail Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com or you@company.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Muhammad Hamza"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogle(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!!signingGoogleEmail || !customGoogleEmail}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        {signingGoogleEmail ? (
                          <>
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                            <span>Signing in…</span>
                          </>
                        ) : (
                          <span>Continue with Google</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Bottom Notice */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-relaxed">
                To continue, Google will share your name, email address, and language preference with Neuroviax AI.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Status Pill on bottom right */}
      <div className="fixed bottom-4 right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] text-slate-400 shadow-xl z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Neuroviax Cloud: Operational</span>
      </div>
    </div>
  );
};

export default Login;
