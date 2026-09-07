import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
          <XCircle className="w-10 h-10 text-amber-400" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">Checkout Canceled</h1>
          <p className="text-slate-400 text-sm mt-2">
            No charges were made to your account. Your current subscription plan remains unchanged.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-2 text-xs text-slate-400">
          <p className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            Why did this happen?
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400">
            <li>You closed the Stripe Checkout window before completing payment.</li>
            <li>No recurring subscription has been created.</li>
            <li>You can retry whenever you are ready.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/subscription/plans')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
          >
            <Sparkles className="w-4 h-4" />
            Explore Subscription Plans Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutCancel;
