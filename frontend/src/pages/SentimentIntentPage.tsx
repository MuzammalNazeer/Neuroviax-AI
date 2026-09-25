import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SEO from '../components/SEO';
import {
  MessageSquareQuote,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Activity,
  Compass,
  ArrowRight,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Truck,
  Package,
  DollarSign,
  Headphones,
  UserCheck,
  Check,
  RotateCcw,
  Zap,
  TrendingUp,
  Brain,
  MessageCircle,
  ShieldAlert,
  Clock,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  customerName: string;
  channel: string;
  rating: number;
  text: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
  probabilities: {
    positive: number;
    neutral: number;
    negative: number;
  };
  aspects: {
    delivery: string;
    product: string;
    price: string;
    service: string;
  };
  churnRisk: boolean;
  urgencyTier: 'normal' | 'elevated_attention' | 'critical_churn_risk';
  status: 'pending' | 'resolved';
  resolutionNotes?: string;
}

interface SentimentDashboardData {
  metrics: {
    totalFeedbackEvaluated: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
    netSentimentScore: number;
    churnRisksDetected: number;
    activeCriticalEscalations: number;
  };
  aspectSatisfaction: {
    delivery: number;
    product: number;
    price: number;
    service: number;
  };
  intentDistribution: Array<{
    intent: string;
    count: number;
    percentage: number;
    label: string;
  }>;
  feedbacks: FeedbackItem[];
  modelDetails: {
    sentimentModel: string;
    intentModel: string;
    languagesSupported: string[];
  };
}

const SAMPLE_SENTIMENT_QUERIES = [
  {
    label: '🌟 High Praise (Urdu/English)',
    text: 'MashAllah bohot zabardast product hai! Quality ekdum top-notch thi aur delivery bhi 24 ghante mein pohanch gayi. Bohat shukriya!',
  },
  {
    label: '🚨 Delivery Delay & Box Damage',
    text: 'Delivery rider bohot rude tha aur parcel box open tha! Item damaged nahi thi lekin packaging bilkul kharab thi. Next time acha rider bhejein.',
  },
  {
    label: '⚠️ Churn & Refund Escalation',
    text: 'Bohot bakwas service! Maine return request di thi 3 din pehle abhi tak paise wapis nahi mile. Dhoka mat do mera refund immediately process karo.',
  },
  {
    label: '💎 Premium Monitor Review',
    text: 'Excellent quality monitor and packaging was very secure. Value for money is outstanding compared to market rates. Highly recommended!',
  },
];

const SAMPLE_INTENT_QUERIES = [
  {
    label: '📦 Inventory Stock Inquiry',
    query: 'Hamare warehouse mein SKU-994 Organic Green Tea ka kitna stock bacha hai aur reorder kab karna hoga?',
  },
  {
    label: '💰 Financial Liquidity Forecast',
    query: 'What is our predicted cash-runway for the next 30 days factoring upcoming supplier dues and payroll?',
  },
  {
    label: '🚚 Live Dispatch Order Tracking',
    query: 'Order #NX-9421 kahan tak pohancha aur courier tracking status kya hai?',
  },
  {
    label: '💳 Customer Refund & Dispute',
    query: 'Customer ko ₨ 14,000 ka refund initiate karna hai wrong item deliver hone par.',
  },
  {
    label: '🤝 Supplier RFQ Procurement',
    query: 'Alpha Distributors se 500 units ka naya Purchase Order draft karo with wholesale pricing.',
  },
];

export const SentimentIntentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment_tester' | 'intent_tester'>('overview');
  const [data, setData] = useState<SentimentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Live Sentiment Tester State
  const [sentimentInput, setSentimentInput] = useState<string>(SAMPLE_SENTIMENT_QUERIES[0].text);
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [analyzingSentiment, setAnalyzingSentiment] = useState<boolean>(false);

  // Live Intent Tester State
  const [intentInput, setIntentInput] = useState<string>(SAMPLE_INTENT_QUERIES[0].query);
  const [intentResult, setIntentResult] = useState<any>(null);
  const [classifyingIntent, setClassifyingIntent] = useState<boolean>(false);

  // Resolution feedback toast
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/sentiment-intent/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load Sentiment/Intent Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Run initial live test analyses
    runSentimentAnalysis(SAMPLE_SENTIMENT_QUERIES[0].text);
    runIntentClassification(SAMPLE_INTENT_QUERIES[0].query);
  }, []);

  const runSentimentAnalysis = async (text: string) => {
    if (!text.trim()) return;
    setAnalyzingSentiment(true);
    try {
      const res = await api.post('/ai/sentiment-intent/analyze-sentiment', { text });
      setSentimentResult(res.data);
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    } finally {
      setAnalyzingSentiment(false);
    }
  };

  const runIntentClassification = async (query: string) => {
    if (!query.trim()) return;
    setClassifyingIntent(true);
    try {
      const res = await api.post('/ai/sentiment-intent/classify-intent', { query });
      setIntentResult(res.data);
    } catch (err) {
      console.error('Intent classification error:', err);
    } finally {
      setClassifyingIntent(false);
    }
  };

  const handleResolveFeedback = async (feedbackId: string, actionType: string) => {
    try {
      const res = await api.post('/ai/sentiment-intent/resolve-feedback', {
        feedbackId,
        actionType,
        notes: `Executed ${actionType} from Sentiment Intelligence Console`,
      });

      setActionMsg(res.data?.message || 'Action executed successfully.');
      setTimeout(() => setActionMsg(null), 4000);

      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          feedbacks: prev.feedbacks.map((f) =>
            f.id === feedbackId ? { ...f, status: 'resolved' } : f
          ),
        };
      });
    } catch (err) {
      console.error('Failed to resolve feedback:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title="Customer Sentiment & Business Intent Intelligence — Neuroviax AI"
        description="BERT-powered natural language processing engine analyzing customer feedback sentiment and classifying business intent for autonomous retail workflows."
      />

      {/* ── Top Executive Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>BERT & LLM Multilingual NLP Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Customer Sentiment & Intent Intelligence
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transformer-based language models analyze customer reviews across <strong>English, Urdu & Roman Urdu</strong>, detect <strong>Churn Risks</strong>, and route user inquiries to autonomous business actions.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Feedback & CSAT Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('sentiment_tester')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sentiment_tester'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>BERT Sentiment Tester</span>
            </button>

            <button
              onClick={() => setActiveTab('intent_tester')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'intent_tester'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Intent Classification</span>
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </motion.div>
      )}

      {/* ── KPI Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Sentiment Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Net Sentiment Index
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
              {data?.metrics?.netSentimentScore || 68}%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              +{data?.metrics?.netSentimentScore || 68} pts
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">
              {data?.metrics?.positivePercentage || 74}% Positive • {data?.metrics?.negativePercentage || 12}% Negative
            </div>
          </div>
        </div>

        {/* Churn Risks Flagged */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Churn Risks Detected
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-rose-600">
              {data?.metrics?.churnRisksDetected || 2} Customers
            </div>
            <div className="text-xs text-rose-600 mt-1 font-medium">
              Requires immediate 1-tap WhatsApp retention voucher
            </div>
          </div>
        </div>

        {/* Aspect: Product Quality */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              Product Quality
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {data?.aspectSatisfaction?.product || 92}% CSAT
            </div>
            <div className="text-xs text-indigo-600 mt-1 font-medium">
              High catalog satisfaction, minimal returns
            </div>
          </div>
        </div>

        {/* Aspect: Delivery Experience */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Delivery & Logistics
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-700">
              {data?.aspectSatisfaction?.delivery || 74}% CSAT
            </div>
            <div className="text-xs text-amber-600 mt-1 font-medium">
              Couriers flagged for packaging & delayed handoff
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW & LIVE CUSTOMER FEEDBACK STREAM ──────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Aspect Health Breakdown & Intent Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aspect Satisfaction Progress Bars */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                Aspect-Based Sentiment Attribution (ABSA)
              </h2>
              <p className="text-xs text-slate-500">
                BERT model isolates sentiment drivers across operational departments:
              </p>

              <div className="space-y-3.5 pt-2">
                {/* Product Quality */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-600" /> Product Quality & Durability
                    </span>
                    <span className="text-indigo-600 font-bold">{data?.aspectSatisfaction?.product || 92}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data?.aspectSatisfaction?.product || 92}%` }} />
                  </div>
                </div>

                {/* Staff & Service */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-emerald-600" /> Staff Behavior & Customer Care
                    </span>
                    <span className="text-emerald-600 font-bold">{data?.aspectSatisfaction?.service || 88}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data?.aspectSatisfaction?.service || 88}%` }} />
                  </div>
                </div>

                {/* Pricing & Value */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Price Competitiveness & Value
                    </span>
                    <span className="text-purple-600 font-bold">{data?.aspectSatisfaction?.price || 85}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data?.aspectSatisfaction?.price || 85}%` }} />
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-600" /> Courier Speed & Box Condition
                    </span>
                    <span className="text-amber-600 font-bold">{data?.aspectSatisfaction?.delivery || 74}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data?.aspectSatisfaction?.delivery || 74}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiries Intent Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                Customer Inquiry Intent Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Automated classification of customer touchpoints across enterprise channels:
              </p>

              <div className="space-y-2.5 pt-2">
                {data?.intentDistribution?.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <span className="text-[10px] font-mono text-purple-700">{item.intent}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900">{item.percentage}%</span>
                      <div className="text-[10px] text-slate-400">{item.count} queries</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Customer Feedbacks Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
                  Live Omnichannel Customer Feedback Stream
                </h3>
                <p className="text-xs text-slate-500">
                  Reviews from WhatsApp, Google Reviews, POS Surveys processed via BERT
                </p>
              </div>

              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Feedbacks</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.feedbacks?.map((fb) => {
                const isPos = fb.sentiment === 'positive';
                const isNeg = fb.sentiment === 'negative';

                return (
                  <div key={fb.id} className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                            isPos
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isNeg
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isPos ? <Smile className="w-3 h-3 text-emerald-600" /> : isNeg ? <Frown className="w-3 h-3 text-rose-600" /> : <Meh className="w-3 h-3 text-slate-500" />}
                          <span>{fb.sentiment} ({Math.round(fb.confidence * 100)}%)</span>
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600">
                          {fb.channel}
                        </span>

                        {fb.churnRisk && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                            ⚠️ HIGH CHURN RISK
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(fb.date).toLocaleDateString()} {new Date(fb.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900">{fb.customerName}</div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{fb.text}</p>

                      {/* Aspects tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(fb.aspects).map(([asp, state]) => {
                          if (state === 'not_mentioned') return null;
                          return (
                            <span
                              key={asp}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded capitalize ${
                                state === 'positive'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {asp}: {state}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Resolution Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {fb.status === 'resolved' ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : fb.churnRisk ? (
                        <button
                          onClick={() => handleResolveFeedback(fb.id, 'send_apology_voucher')}
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/20 flex items-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Send 15% Voucher</span>
                        </button>
                      ) : isPos ? (
                        <button
                          onClick={() => handleResolveFeedback(fb.id, 'send_loyalty_thankyou')}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Smile className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Thank Customer</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResolveFeedback(fb.id, 'contact_customer')}
                          className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                        >
                          <span>Review Issue</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE BERT SENTIMENT TESTER ─────────────────────── */}
      {activeTab === 'sentiment_tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Sandbox */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smile className="w-4 h-4 text-emerald-600" />
                BERT Sentiment & Aspect Analysis Sandbox
              </h2>
              <p className="text-xs text-slate-500">
                Type any customer review in English, Urdu, or Roman Urdu to inspect token probabilities:
              </p>
            </div>

            {/* Quick Sample Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_SENTIMENT_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSentimentInput(q.text);
                    runSentimentAnalysis(q.text);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={sentimentInput}
              onChange={(e) => setSentimentInput(e.target.value)}
              placeholder="Paste customer message, WhatsApp review, or survey text..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />

            <button
              onClick={() => runSentimentAnalysis(sentimentInput)}
              disabled={analyzingSentiment}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${analyzingSentiment ? 'animate-spin' : ''}`} />
              <span>{analyzingSentiment ? 'BERT Evaluating...' : 'Analyze Sentiment (BERT)'}</span>
            </button>
          </div>

          {/* Analysis Result Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              BERT Neural Output & Probabilities
            </h3>

            {sentimentResult ? (
              <div className="space-y-4">
                {/* Result Hero Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    sentimentResult.sentiment === 'positive'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : sentimentResult.sentiment === 'negative'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-slate-100 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {sentimentResult.sentiment === 'positive' ? (
                      <Smile className="w-8 h-8 text-emerald-600" />
                    ) : sentimentResult.sentiment === 'negative' ? (
                      <Frown className="w-8 h-8 text-rose-600" />
                    ) : (
                      <Meh className="w-8 h-8 text-slate-600" />
                    )}
                    <div>
                      <div className="text-xs uppercase font-bold tracking-wider opacity-75">
                        Predicted Polarity
                      </div>
                      <div className="text-xl font-black capitalize">
                        {sentimentResult.sentiment} Sentiment
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs uppercase font-bold tracking-wider opacity-75">Confidence</div>
                    <div className="text-xl font-black font-mono">
                      {Math.round(sentimentResult.confidence * 100)}%
                    </div>
                  </div>
                </div>

                {/* Softmax Probability Bars */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Softmax Distribution:</div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <div className="flex justify-between mb-0.5 font-medium">
                        <span className="text-emerald-700">Positive:</span>
                        <span className="font-mono font-bold">{Math.round((sentimentResult.probabilities?.positive || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((sentimentResult.probabilities?.positive || 0) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5 font-medium">
                        <span className="text-slate-600">Neutral:</span>
                        <span className="font-mono font-bold">{Math.round((sentimentResult.probabilities?.neutral || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${Math.round((sentimentResult.probabilities?.neutral || 0) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5 font-medium">
                        <span className="text-rose-700">Negative:</span>
                        <span className="font-mono font-bold">{Math.round((sentimentResult.probabilities?.negative || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.round((sentimentResult.probabilities?.negative || 0) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aspect Extraction */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700 mb-2">Aspect Sentiments Detected:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(sentimentResult.aspects || {}).map(([asp, pol]: any) => (
                      <div key={asp} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-semibold capitalize text-slate-700">{asp}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-bold ${
                            pol === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pol === 'negative'
                              ? 'bg-rose-100 text-rose-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {pol.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Awaiting input to run BERT sentiment forward pass...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: BUSINESS INTENT CLASSIFICATION TESTER ─────────── */}
      {activeTab === 'intent_tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Sandbox */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                BERT / LLM Business Intent Classifier
              </h2>
              <p className="text-xs text-slate-500">
                Type any user question or conversational prompt to classify intent and propose workflow execution:
              </p>
            </div>

            {/* Quick Sample Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_INTENT_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIntentInput(q.query);
                    runIntentClassification(q.query);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              placeholder="Ask a question (e.g. check inventory, predict revenue, track order, request refund)..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
            />

            <button
              onClick={() => runIntentClassification(intentInput)}
              disabled={classifyingIntent}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${classifyingIntent ? 'animate-spin' : ''}`} />
              <span>{classifyingIntent ? 'Routing Intent...' : 'Classify Intent (BERT/LLM)'}</span>
            </button>
          </div>

          {/* Classification Result Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Intent Routing & Autonomous Workflow Action
            </h3>

            {intentResult ? (
              <div className="space-y-4">
                {/* Result Hero Banner */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">
                      Primary Classified Intent
                    </span>
                    <div className="text-lg font-black text-purple-950 mt-0.5">
                      {intentResult.label}
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-700">
                      [{intentResult.intent}]
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">
                      Confidence
                    </span>
                    <div className="text-2xl font-black font-mono text-purple-900">
                      {Math.round(intentResult.confidence * 100)}%
                    </div>
                  </div>
                </div>

                {/* Sub-intent and Workflow Proposal */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Sub-Intent Action:</span>
                    <span className="font-mono font-bold text-slate-900">{intentResult.subIntent}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">ABOP Target Route:</span>
                    <span className="font-mono font-bold text-indigo-600">{intentResult.targetRoute}</span>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 block mb-0.5">
                      Proposed Autonomous Action:
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {intentResult.suggestedAction}
                    </span>
                  </div>
                </div>

                {/* Alternative Intents */}
                {intentResult.topAlternatives?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                      Secondary Candidates:
                    </div>
                    <div className="space-y-1">
                      {intentResult.topAlternatives.map((alt: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                          <span>{alt.label}</span>
                          <span className="font-mono text-slate-400">Score: {alt.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Awaiting query to classify business intent...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentIntentPage;
