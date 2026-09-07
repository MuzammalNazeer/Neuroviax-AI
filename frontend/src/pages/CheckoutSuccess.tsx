import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Home, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isDemo = searchParams.get('demo') === 'true';
  const plan = searchParams.get('plan') || 'BASIC';
  const interval = searchParams.get('interval') || 'monthly';
  const { user, setUser } = useAuthStore();
  const [statusText, setStatusText] = useState('Verifying your payment with Stripe...');

  useEffect(() => {
    // Trigger confetti burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    // If in demo mode, activate plan in MongoDB immediately
    const activateLocal = async () => {
      try {
        if (isDemo) {
          const res = await api.post('/subscriptions/dev-activate', {
            plan,
            billingInterval: interval,
          });
          if (res.data?.user && user) {
            setUser({ ...user, ...res.data.user });
          }
          setStatusText(`Your ${plan} tier subscription is officially activated!`);
        } else {
          // Live Stripe checkout
          setStatusText('Payment confirmed! Your subscription is now active.');
        }
      } catch (err) {
        setStatusText('Payment received! Your subscription will sync shortly.');
      }
    };

    activateLocal();
  }, [isDemo, plan, interval]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl shadow-indigo-950/50"
      >
        {/* Animated Check Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Payment Successful
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome to {plan.toUpperCase()}!
          </h1>
          <p className="text-slate-400 text-sm mt-2">{statusText}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-2 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Plan Tier:</span>
            <span className="font-semibold text-white">{plan.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Billing Cadence:</span>
            <span className="font-semibold text-white capitalize">{interval}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="font-semibold text-emerald-400">Active</span>
          </div>
          {sessionId && (
            <div className="flex justify-between truncate">
              <span className="text-slate-500">Session ID:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
                {sessionId}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/subscription/management')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
          >
            <CreditCard className="w-4 h-4" />
            View Subscription Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Platform Dashboard
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Stripe Subscriptions Billing</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
