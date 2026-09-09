import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, signInWithPopup, isFirebaseConfigured } from '../firebase';
import SEO from '../components/SEO';
import {
  Sparkles,
  User,
  Mail,
  Building2,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

const Register: React.FC = () => {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service & Privacy Policy');
      return;
    }

    try {
      await register(form.name, form.email, form.password, form.businessName, false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: form.email,
            message: 'Account registered successfully! Please sign in with your credentials.',
          },
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      <SEO
        title="Start Your Free AI Business Operating System"
        description="Launch your Neuroviax ABOP workspace. Multi-branch inventory tracking, automated orders, cash flow forecasting, and 6 intelligent domain copilots. Free starter tier."
        canonical="https://neuroviax.ai/register"
        keywords="Create Neuroviax account, register ABOP, free business software Pakistan, SME AI automation signup"
      />
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-md bg-slate-900/85 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/80 relative z-10 space-y-5"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center text-emerald-950 mx-auto shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <h1 className="text-2xl font-black font-display tracking-tight text-white">
            Launch Your ABOP Workspace
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-First Enterprise Operating Platform • Multi-Branch Provisioned
          </p>
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🏪', label: 'Multi-Branch Support' },
            { icon: '🤖', label: 'AI Procurement' },
            { icon: '💰', label: 'Cash-Flow Forecasting' },
            { icon: '🔐', label: 'JWT Token Security' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-2.5 py-1.5"
            >
              <span className="text-xs">{f.icon}</span>
              <span className="text-[10px] font-semibold text-emerald-200">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={async () => {
            if (isFirebaseConfigured()) {
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
                navigate('/dashboard');
              } catch (err: any) {
                console.error('Firebase Google sign-up error:', err);
                if (err.code !== 'auth/popup-closed-by-user') {
                  navigate('/login');
                }
              }
            } else {
              navigate('/login');
            }
          }}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 transition active:scale-95 shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or with Email</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Name</span>
            </label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Alex Mercer"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Work Email Address</span>
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Business / Organization Name</span>
            </label>
            <input
              name="businessName"
              type="text"
              required
              value={form.businessName}
              onChange={handleChange}
              placeholder="e.g. Apex Global Logistics"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
            />
          </div>

          {/* Password with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Password</span>
              </span>
              <span className="text-[10px] text-slate-500">Min 8 characters</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                minLength={8}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
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

            {/* Password strength meter */}
            {form.password && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                  <div
                    className={`h-full flex-1 transition-all ${
                      strength >= 1 ? 'bg-red-500' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 transition-all ${
                      strength >= 2 ? 'bg-amber-500' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 transition-all ${
                      strength >= 3 ? 'bg-emerald-400' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 transition-all ${
                      strength >= 4 ? 'bg-emerald-300' : 'bg-transparent'
                    }`}
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-medium">
                  {strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirm Password</span>
            </label>
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-inner"
            />
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <div
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                agreedToTerms
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                  : 'border-slate-600 bg-slate-800'
              }`}
            >
              {agreedToTerms && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight select-none">
              I agree to the{' '}
              <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl p-2.5 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl p-2.5 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Account created successfully! Redirecting to login…</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl py-2.5 text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Creating Workspace…' : 'Create Business Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Footer link */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
