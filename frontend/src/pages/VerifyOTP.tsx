import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import {
  Sparkles,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Layers,
} from 'lucide-react';

const OTP_LENGTH = 6;

const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as any) || {};
  const email: string = state.email || 'demo@neuroviax.ai';
  const mode: 'signup' | 'reset-password' = state.mode || 'reset-password';
  const signupData = state.signupData;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 min

  // 3D & Laser states
  const [isLaserSweeping, setIsLaserSweeping] = useState(false);
  const [isDominoWaving, setIsDominoWaving] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const isFusion = digits.every((d) => d !== '');

  // Web Audio Synthesizer
  const playSound = useCallback((type: 'flip' | 'laser' | 'fusion', offset = 0) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + offset * 60, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'fusion') {
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.1, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.4);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.45);
        });
      }
    } catch {
      // Audio fallback silent
    }
  }, [audioEnabled]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  // Trigger intro laser sweep on mount
  useEffect(() => {
    triggerLaserSweep();
    triggerDominoWave();
    inputRefs.current[0]?.focus();
  }, []);

  // When all digits are entered, activate Fusion
  useEffect(() => {
    if (isFusion) {
      playSound('fusion');
    }
  }, [isFusion, playSound]);

  const triggerLaserSweep = () => {
    setIsLaserSweeping(false);
    requestAnimationFrame(() => {
      setIsLaserSweeping(true);
      playSound('laser');
      setTimeout(() => setIsLaserSweeping(false), 900);
    });
  };

  const triggerDominoWave = () => {
    setIsDominoWaving(true);
    triggerLaserSweep();
    setTimeout(() => setIsDominoWaving(false), 700);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const char = val.slice(-1);
    const updated = [...digits];
    updated[idx] = char;
    setDigits(updated);

    if (char) {
      playSound('flip', idx);
      if (idx < OTP_LENGTH - 1) {
        setActiveIdx(idx + 1);
        inputRefs.current[idx + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        const updated = [...digits];
        updated[idx - 1] = '';
        setDigits(updated);
        setActiveIdx(idx - 1);
        inputRefs.current[idx - 1]?.focus();
        playSound('flip', 0);
      } else if (digits[idx]) {
        const updated = [...digits];
        updated[idx] = '';
        setDigits(updated);
        playSound('flip', 0);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      setActiveIdx(idx - 1);
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      setActiveIdx(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = [...digits];
    pasted.split('').forEach((ch, i) => { updated[i] = ch; });
    setDigits(updated);
    triggerLaserSweep();
    playSound('flip', 3);

    const nextEmpty = updated.findIndex((d) => !d);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    setActiveIdx(focusIdx);
    inputRefs.current[focusIdx]?.focus();
  };

  // Mouse Parallax 3D Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setTilt({ x: -y * 8, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      triggerLaserSweep();
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await api.post('/auth/register', {
          ...(signupData || {}),
          email,
          otp,
        });
        playSound('fusion');
        navigate('/login', {
          state: {
            registeredEmail: email,
            message: 'Email verified and account registered successfully! Please sign in with your password.',
          },
        });
      } else {
        const res = await api.post('/auth/verify-otp', { email, otp });
        playSound('fusion');
        navigate('/reset-password', { state: { email, resetToken: res.data.resetToken } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
      triggerLaserSweep();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);
    try {
      if (mode === 'signup') {
        await api.post('/auth/register-send-otp', {
          name: signupData?.name,
          email,
        });
        setCountdown(600);
        setDigits(Array(OTP_LENGTH).fill(''));
        setActiveIdx(0);
        setSuccess('A new signup code has been sent to your email.');
      } else {
        await api.post('/auth/forgot-password', { email });
        setCountdown(600);
        setDigits(Array(OTP_LENGTH).fill(''));
        setActiveIdx(0);
        setSuccess('A new code has been sent to your email.');
      }
      triggerDominoWave();
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleFillDevOTP = (code: string) => {
    const updated = code.slice(0, OTP_LENGTH).split('');
    triggerLaserSweep();
    code.split('').forEach((ch, i) => {
      setTimeout(() => {
        setDigits((prev) => {
          const n = [...prev];
          n[i] = ch;
          return n;
        });
        playSound('flip', i);
      }, i * 80);
    });
    setActiveIdx(OTP_LENGTH - 1);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">No email provided. Please start over.</p>
          <Link to="/forgot-password" className="text-emerald-400 font-bold hover:underline text-sm">
            ← Back to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden py-12 domino-perspective">
      {/* Ambient Cyber Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Main 3D Card Shell */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1)',
        }}
        className="w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800/90 relative z-10 space-y-6 preserve-3d"
      >
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3.5 py-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>3D Domino Flip &amp; Fusion</span>
          </div>

          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-cyan-400 bg-slate-800/60 border border-slate-700/60 rounded-xl px-2.5 py-1 transition-all"
            title={audioEnabled ? 'Mute synthesized audio' : 'Enable synthesized audio'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>{audioEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center text-emerald-950 mx-auto shadow-lg shadow-emerald-500/20"
          >
            <ShieldCheck className="w-6 h-6" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Enter Your Security Code</h1>
          <p className="text-xs text-slate-400">
            Domino verification code sent to <span className="text-cyan-400 font-mono font-bold">{email}</span>
          </p>
        </div>

        {/* Countdown */}
        <div className={`flex items-center justify-center gap-1.5 text-xs font-bold ${countdown <= 60 ? 'text-rose-400' : 'text-slate-400'}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>Expires in {formatTime(countdown)}</span>
        </div>



        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 3D DOMINO STAGE */}
          <div className="relative pt-2 pb-2">
            {/* Laser Sweep Track */}
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden rounded-2xl z-20">
              <div
                className={`absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#fff,0_0_20px_#06b6d4,0_0_40px_#10b981] ${
                  isFusion
                    ? 'animate-laser-fusion opacity-100'
                    : isLaserSweeping
                    ? 'animate-laser-sweep'
                    : 'opacity-0'
                }`}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-16 bg-cyan-400/40 blur-md rounded-full" />
              </div>
            </div>

            {/* 6 3D Domino Tiles */}
            <div className={`grid grid-cols-6 gap-2 sm:gap-3 domino-perspective preserve-3d ${isFusion ? 'fusion-active' : ''}`} onPaste={handlePaste}>
              {digits.map((digit, i) => {
                const isFlipped = digit !== '';
                const isActive = activeIdx === i;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveIdx(i);
                      inputRefs.current[i]?.focus();
                    }}
                    className={`relative h-16 sm:h-20 cursor-pointer preserve-3d transition-transform ${
                      isDominoWaving ? 'animate-domino-intro' : ''
                    }`}
                    style={{
                      animationDelay: `${i * 70}ms`,
                    }}
                  >
                    {/* Invisible Native Input Overlay for Focus & Accessibility */}
                    <input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onFocus={() => setActiveIdx(i)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-30 w-full h-full"
                    />

                    {/* 3D Domino Card Body */}
                    <div
                      className={`w-full h-full rounded-2xl preserve-3d transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        isFusion && isFlipped ? 'animate-fusion-pulse' : ''
                      }`}
                      style={{
                        transform: isFlipped ? 'rotateY(180deg) translateZ(6px)' : 'rotateY(0deg) translateZ(0px)',
                      }}
                    >
                      {/* Left & Right 3D Thickness Extrusion Edges */}
                      <div className="absolute top-1 bottom-1 -left-1 w-2 bg-slate-950/70 rounded-l backface-hidden -rotate-y-90 pointer-events-none" />
                      <div className="absolute top-1 bottom-1 -right-1 w-2 bg-slate-950/70 rounded-r backface-hidden rotate-y-90 pointer-events-none" />

                      {/* FRONT FACE (Blank / Idle / Cursor active) */}
                      <div
                        style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
                        className={`absolute inset-0 rounded-2xl flex items-center justify-center backface-hidden border transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                            : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/80 shadow-lg'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-all ${
                            isActive
                              ? 'bg-cyan-400 scale-125 animate-ping'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* BACK FACE (Flipped & Glowing Digit) */}
                      <div
                        style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                        className={`absolute inset-0 rounded-2xl flex items-center justify-center backface-hidden border font-mono font-black text-2xl sm:text-3xl transition-all ${
                          isFusion
                            ? 'bg-gradient-to-br from-emerald-800/90 to-teal-900/90 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                            : 'bg-gradient-to-br from-emerald-950/90 to-teal-950/90 border-emerald-500/80 text-emerald-300 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]'
                        }`}
                      >
                        <span className="drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                          {digit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fusion Energy Glow Line */}
            <div
              className={`h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent mt-3 transition-opacity duration-500 ${
                isFusion ? 'opacity-100 shadow-[0_0_12px_#10b981]' : 'opacity-0'
              }`}
            />
          </div>

          {/* Interactive Utility Trigger Bar */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={triggerDominoWave}
              className="text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1.5 transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Domino Cascade</span>
            </button>
            <button
              type="button"
              onClick={triggerLaserSweep}
              className="text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1.5 transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Laser Sweep</span>
            </button>
            <a
              href="/domino-otp.html"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/40 rounded-xl px-3 py-1.5 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pure Vanilla Demo</span>
            </a>
          </div>

          {/* Error / Success Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl p-3"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || countdown <= 0}
            className={`w-full font-black rounded-xl py-3.5 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg ${
              isFusion
                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <span>{loading ? 'Authenticating…' : isFusion ? 'Authenticate Locked Code' : 'Verify Code'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Resend */}
        <div className="text-center pt-2">
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-xs text-slate-400 hover:text-emerald-400 transition font-bold flex items-center gap-1.5 mx-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
            {resendLoading ? 'Sending…' : "Didn't receive a code? Resend"}
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
          <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline">
            ← Change email address
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
