import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  Clock,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

const OTP_LENGTH = 6;

const Register: React.FC = () => {
  const register = useAuthStore((s) => s.register);
  const sendSignupOTP = useAuthStore((s) => s.sendSignupOTP);
  const loading = useAuthStore((s) => s.loading);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Multi-step state: 'form' -> 'verify'
  const [step, setStep] = useState<'form' | 'verify'>('form');

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
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes expiry
  const [resendCooldown, setResendCooldown] = useState<number>(60); // 60s cooldown
  const [resending, setResending] = useState<boolean>(false);
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);

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

  // Countdown timers
  useEffect(() => {
    if (step !== 'verify') return;
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (step !== 'verify') return;
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Focus first digit when transitioning to verify step
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // STEP 1: Submit Form & Send 6-Digit Email Code
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service & Privacy Policy');
      return;
    }

    try {
      await sendSignupOTP(form.name, form.email);
      setStep('verify');
      setCountdown(600);
      setResendCooldown(60);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch verification code');
    }
  };

  // OTP Digit Change Handler
  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const char = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (char && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all digits filled
    if (char && index === OTP_LENGTH - 1 && updated.every((d) => d !== '')) {
      handleCompleteSignup(updated.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const updated = [...otpDigits];
    pasted.split('').forEach((ch, idx) => {
      if (idx < OTP_LENGTH) updated[idx] = ch;
    });
    setOtpDigits(updated);

    const nextIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputsRef.current[nextIdx]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleCompleteSignup(pasted);
    }
  };

  // STEP 2: Verify OTP & Complete Signup
  const handleCompleteSignup = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setError('');
    try {
      await register(form.name, form.email, form.password, form.businessName, code, false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: form.email,
            message: 'Email verified and account registered successfully! Please sign in with your password.',
          },
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    }
  };

  // Resend Code Handler
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await sendSignupOTP(form.name, form.email);
      setResendCooldown(60);
      setCountdown(600);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
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
            whileHover={{ scale: 1.05 }}
            className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border border-slate-700/60 cursor-pointer overflow-hidden"
          >
            <img src="/logo.png" alt="Neuroviax AI Logo" className="w-full h-full object-contain rounded-xl" />
          </motion.div>
          <h1 className="text-2xl font-black font-display tracking-tight text-white">
            {step === 'form' ? 'Launch Your ABOP Workspace' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {step === 'form'
              ? 'AI-First Enterprise Operating Platform • Multi-Branch Provisioned'
              : `Enter the 6-digit code dispatched to ${form.email}`}
          </p>
        </div>

        {/* Feature bullets (Only shown in Step 1) */}
        {step === 'form' && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🏪', label: 'Multi-Branch Support' },
              { icon: '🤖', label: 'AI Procurement' },
              { icon: '💰', label: 'Cash-Flow Forecasting' },
              { icon: '🔐', label: 'Email Verified Auth' },
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
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <>
            {/* Google SSO Button */}
            <button
              type="button"
              disabled={googleLoading}
              onClick={async () => {
                setGoogleLoading(true);
                setError('');
                try {
                  if (isFirebaseConfigured() && auth && googleProvider) {
                    const result = await signInWithPopup(auth, googleProvider);
                    const idToken = await result.user.getIdToken();
                    await loginWithGoogle({
                      email: result.user.email || undefined,
                      name: result.user.displayName || undefined,
                      googleId: result.user.uid,
                      idToken,
                    });
                    navigate('/dashboard');
                  } else {
                    window.location.href = 'http://localhost:5000/api/auth/google';
                  }
                } catch (err: any) {
                  setError(err.message || 'Google signup failed');
                } finally {
                  setGoogleLoading(false);
                }
              }}
              className="w-full bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700/80 transition-all flex items-center justify-center gap-2.5 shadow-sm hover:border-slate-600 disabled:opacity-50 cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{googleLoading ? 'Opening Google…' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or with Email</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleRequestOTP} className="space-y-3">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {form.password && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 transition-all ${strength >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${strength >= 3 ? 'bg-emerald-400' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${strength >= 4 ? 'bg-emerald-300' : 'bg-transparent'}`} />
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
                    agreedToTerms ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {agreedToTerms && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight select-none">
                  I agree to the{' '}
                  <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">Terms of Service</span> and{' '}
                  <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
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

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl py-2.5 text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? 'Sending 6-Digit Code…' : 'Send 6-Digit Verification Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </>
        )}

        {/* STEP 2: 6-DIGIT EMAIL VERIFICATION SCREEN */}
        {step === 'verify' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Notification Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Check Your Inbox</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError('');
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Edit Email</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300">
                We've sent a 6-digit confirmation code to <strong className="text-white">{form.email}</strong>.
              </p>
            </div>



            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 text-center flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enter 6-Digit Code</span>
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-black rounded-2xl border transition-all duration-200 outline-none ${
                      digit
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800/80 border-slate-700/80 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Expires in <strong className="text-emerald-400 font-mono">{formatTime(countdown)}</strong></span>
              </span>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || resending}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
              >
                {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>{resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}</span>
              </button>
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
                <span>Email verified! Redirecting to Sign In…</span>
              </motion.div>
            )}

            {/* Submit Verification Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="button"
              disabled={loading || otpDigits.some((d) => d === '')}
              onClick={() => handleCompleteSignup()}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl py-3 text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code & Creating Workspace…</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Complete Signup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}

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
