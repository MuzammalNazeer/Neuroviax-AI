import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight, Crown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface SubscriptionGateProps {
  requiredPlan?: 'BASIC' | 'PRO';
  featureName?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  requiredPlan = 'BASIC',
  featureName = 'this premium capability',
  children,
  fallback,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const planRanks: Record<string, number> = {
    FREE: 0,
    BASIC: 1,
    PRO: 2,
  };

  const userPlan = (user?.currentPlan || 'FREE').toUpperCase();
  const userRank = planRanks[userPlan] || 0;
  const requiredRank = planRanks[requiredPlan] || 1;

  const hasAccess = userRank >= requiredRank;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 text-center space-y-4 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        {requiredPlan === 'PRO' ? <Crown className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">
          {requiredPlan} Subscription Required
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Access to {featureName} is reserved for {requiredPlan} tier subscribers. Upgrade today to unlock full capabilities.
        </p>
      </div>

      <button
        onClick={() => navigate('/subscription/plans')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/25"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade to {requiredPlan}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SubscriptionGate;
