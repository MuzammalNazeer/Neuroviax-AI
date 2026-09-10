import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

type Strength = 'weak' | 'fair' | 'good' | 'strong';

const getStrength = (pw: string): { label: Strength; score: number; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: 'weak', score: 1, color: '#ef4444' };
  if (score === 2) return { label: 'fair', score: 2, color: '#f97316' };
  if (score === 3) return { label: 'good', score: 3, color: '#eab308' };
  return { label: 'strong', score: 4, color: '#22c55e' };
};

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email: string = (location.state as any)?.email || '';
  const resetToken: string = (location.state as any)?.resetToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const strength = getStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, resetToken, newPassword });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">Invalid session. Please start over.</p>
          <Link to="/forgot-password" className="text-emerald-400 font-bold hover:underline text-sm">
            ← Start over
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-slate-800/80 relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border border-slate-700/60 overflow-hidden"
          >
            <img src="/logo.png" alt="Neuroviax AI Logo" className="w-full h-full object-contain rounded-xl" />
          </motion.div>
          <h1 className="text-2xl font-black tracking-tight text-white">Set New Password</h1>
          <p className="text-xs text-slate-400">Choose a strong password for your account.</p>
        </div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter */}
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 space-y-1"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <motion.div
                          key={bar}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="h-1 flex-1 rounded-full"
                          style={{
                            backgroundColor: bar <= strength.score ? strength.color : '#1e293b',
                            transition: 'background-color 0.3s ease',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold capitalize" style={{ color: strength.color }}>
                      {strength.label} password
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full bg-slate-800/80 border rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-500/70'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-emerald-500'
                        : 'border-slate-700/80 focus:border-emerald-500'
                    }`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl py-3 text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? 'Resetting Password…' : 'Reset Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-7 h-7 text-emerald-950" />
                </motion.div>
                <p className="text-sm font-black text-emerald-200">Password Reset!</p>
                <p className="text-[11px] text-emerald-400/80">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl py-3 text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
