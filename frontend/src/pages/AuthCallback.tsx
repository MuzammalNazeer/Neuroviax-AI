import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens, setUser, setActiveBusiness } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const queryError = searchParams.get('error');

    if (queryError) {
      setError('Google Sign-In failed or was cancelled. Please try again.');
      return;
    }

    if (!token) {
      setError('Missing authentication tokens from Google callback.');
      return;
    }

    const processAuth = async () => {
      try {
        // Store tokens immediately
        setTokens(token, refreshToken || undefined);

        // Pre-populate user from URL params (instant UX while API call runs)
        const urlName = searchParams.get('name');
        const urlEmail = searchParams.get('email');
        if (urlName && urlEmail) {
          setUser({
            _id: '',
            name: decodeURIComponent(urlName),
            email: decodeURIComponent(urlEmail),
            memberships: [],
          });
        }

        // Fetch full authenticated user & business details from backend
        // /auth/me returns the user object directly (not wrapped in { user: ... })
        const res = await api.get('/auth/me');
        const userData = res.data;
        if (userData && (userData._id || userData.email)) {
          setUser(userData);
          const bizId = userData.memberships?.[0]?.business?._id || userData.memberships?.[0]?.business;
          if (bizId) {
            setActiveBusiness(typeof bizId === 'string' ? bizId : bizId._id);
          }
        }

        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

        setTimeout(() => {
          navigate('/');
        }, 600);
      } catch (err: any) {
        console.error('Failed to finalize Google auth:', err);
        // Fallback: token was already stored, proceed to dashboard
        navigate('/');
      }
    };

    processAuth();
  }, [searchParams, navigate, setTokens, setUser, setActiveBusiness]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-xl relative z-10 space-y-5"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center shadow-inner border border-white/10">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
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

        {!error ? (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-white">Google Sign-In Verified</h2>
              <p className="text-xs text-slate-400">Authenticating session & preparing your workspace…</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold py-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
              <span>Redirecting to Dashboard…</span>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              Return to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
