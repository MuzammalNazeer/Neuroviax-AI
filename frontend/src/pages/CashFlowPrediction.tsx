import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Calendar,
  PieChart,
  Sliders,
  Download,
  Wallet,
  ArrowDownRight,
  HelpCircle,
  Search,
} from 'lucide-react';

interface HorizonData {
  horizon: number;
  label: string;
  totalNetCash: number;
  cumulativeNetPosition: number;
  avgDailyNet: number;
  positiveDays: number;
  negativeDays: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  confidenceScore: number;
}

interface DailyPoint {
  date: string;
  day: number;
  predicted: number;
  cumulative: number;
  upper: number;
  lower: number;
  xgbPred: number;
  lgbPred: number;
  emaPred: number;
}

interface FeatureImportance {
  name: string;
  importance: number;
}

interface Insight {
  type: 'warning' | 'positive' | 'caution' | 'info';
  title: string;
  message: string;
  icon: string;
}

interface CashFlowPredictionResponse {
  generated: string;
  dataQuality: {
    paymentRecords: number;
    expenseRecords: number;
    historicalDays: number;
    hasData: boolean;
  };
  snapshot: {
    totalReceivable30d: number;
    totalPayable30d: number;
    totalExpense30d: number;
    netPosition30d: number;
    avgDailyNet: number;
  };
  model: {
    type: string;
    components: string[];
    weights: { xgb: number; lgb: number; ema: number };
    xgboostTrees: number;
    lightgbmLeaves: number;
    lightgbmBins: number;
    features: number;
    trainingSamples: number;
    rmse: number;
    mape: number;
  };
  horizons: HorizonData[];
  daily: DailyPoint[];
  featureImportance: FeatureImportance[];
  expenseBreakdown: Record<string, number>;
  insights: Insight[];
}

export default function CashFlowPrediction() {
  const [data, setData] = useState<CashFlowPredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(30);
  const [showSubmodels, setShowSubmodels] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/payments/cash-flow-prediction?horizon=90');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load cash flow prediction:', err);
      setError(err?.response?.data?.message || 'Failed to generate ensemble cash-flow prediction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const activeHorizonData = useMemo(() => {
    if (!data) return null;
    return data.horizons.find((h) => h.horizon === selectedHorizon) || data.horizons[2];
  }, [data, selectedHorizon]);

  const activeDailySlice = useMemo(() => {
    if (!data) return [];
    return data.daily.slice(0, selectedHorizon);
  }, [data, selectedHorizon]);

  const filteredDaily = useMemo(() => {
    if (!searchFilter) return activeDailySlice;
    const q = searchFilter.toLowerCase().trim();
    return activeDailySlice.filter(
      (d) =>
        d.date.toLowerCase().includes(q) ||
        d.day.toString() === q
    );
  }, [activeDailySlice, searchFilter]);

  const maxAbsoluteDaily = useMemo(() => {
    if (!activeDailySlice.length) return 100;
    const maxVal = Math.max(
      ...activeDailySlice.map((d) => Math.max(Math.abs(d.predicted), Math.abs(d.upper), Math.abs(d.lower)))
    );
    return maxVal > 0 ? maxVal : 100;
  }, [activeDailySlice]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Day', 'Date', 'Ensemble Net ($)', 'Cumulative Net ($)', 'Upper Band ($)', 'Lower Band ($)', 'XGBoost ($)', 'LightGBM ($)', 'EMA ($)'];
    const rows = activeDailySlice.map((d) => [
      d.day,
      d.date,
      d.predicted,
      d.cumulative,
      d.upper,
      d.lower,
      d.xgbPred,
      d.lgbPred,
      d.emaPred,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neuroviax-cash-flow-forecast-${selectedHorizon}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
          <Cpu className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-slate-800 font-semibold tracking-wide text-base">
          Running XGBoost & LightGBM Ensemble Cash-Flow Simulation...
        </p>
        <span className="text-xs text-slate-500">
          Synthesizing historical ledgers, seasonality patterns & liquidity variances
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Banner & Header - Clean Executive Emerald Slate Palette */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 shadow-xl border border-slate-700/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Ensemble ML
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                90-Day Lookahead
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <LineChart className="w-8 h-8 text-emerald-400" />
              AI Cash-Flow Prediction Cockpit
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Multi-horizon liquidity forecasting engine blending XGBoost tree stumps, LightGBM histogram gradient boosting, and seasonal exponential moving averages for cash stability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchForecast}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition text-sm font-medium shadow-sm backdrop-blur"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Recalibrate
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/25"
            >
              <Download className="w-4 h-4" />
              Export Forecast CSV
            </button>
          </div>
        </div>

        {/* Algorithm Blend Status Strip */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs text-slate-300">XGBoost Weight</div>
              <div className="text-sm font-bold text-white">45% (50 Stumps)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <div>
              <div className="text-xs text-slate-300">LightGBM Weight</div>
              <div className="text-sm font-bold text-white">35% (Binned)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div>
              <div className="text-xs text-slate-300">Seasonal EMA</div>
              <div className="text-sm font-bold text-white">20% (Day-of-Week)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div>
              <div className="text-xs text-slate-300">Ensemble Confidence</div>
              <div className="text-sm font-bold text-emerald-400">
                {activeHorizonData?.confidenceScore || 85}% Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Horizon Selector Bar - Clean Glassmorphic Style */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[7, 14, 30, 90].map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHorizon(h)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                selectedHorizon === h
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {h} Days Horizon
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end px-2">
          <button
            onClick={() => setShowSubmodels(!showSubmodels)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              showSubmodels
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            {showSubmodels ? 'Hide Sub-Model Traces' : 'Show Sub-Model Traces'}
          </button>
        </div>
      </div>

      {/* Key Metric Highlights for selected Horizon - Pristine Glass Cards */}
      {activeHorizonData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Projected Net Cash ({selectedHorizon}d)
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeHorizonData.totalNetCash >= 0
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                {activeHorizonData.totalNetCash >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-2xl font-extrabold ${
                  activeHorizonData.totalNetCash >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(activeHorizonData.totalNetCash)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sum of predicted daily net inflows & outflows
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Daily Velocity
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(activeHorizonData.avgDailyNet)}
                <span className="text-xs text-slate-400 font-normal ml-1">/ day</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                Status: <span className="text-emerald-600 font-semibold">{activeHorizonData.trendDirection}</span> trajectory
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Liquidity Health
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900">
                {activeHorizonData.positiveDays}
                <span className="text-sm text-slate-400 font-normal"> / {selectedHorizon} days (+)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeHorizonData.negativeDays} days projected in negative burn
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cumulative Run-Rate
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(activeHorizonData.cumulativeNetPosition)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ending cumulative position at day {selectedHorizon}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Forecast Visualizer - Clean Light Glassmorphic Canvas */}
      <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Cash-Flow Trajectory & Confidence Interval
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily net cash predictions with upper & lower uncertainty boundaries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Ensemble Net Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-slate-600">Cumulative Net</span>
            </div>
            {showSubmodels && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-600">LightGBM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-600">XGBoost</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Visual Chart Bars - Clean Emerald & Coral Gradients */}
        <div className="h-64 flex items-end gap-1.5 pt-8 pb-2 px-2 overflow-x-auto border-b border-slate-200 bg-slate-50/50 rounded-2xl">
          {activeDailySlice.map((d) => {
            const heightPercent = Math.min(
              100,
              Math.max(8, (Math.abs(d.predicted) / maxAbsoluteDaily) * 100)
            );
            const isPos = d.predicted >= 0;

            return (
              <div
                key={d.day}
                className="group relative flex-1 min-w-[12px] flex flex-col items-center justify-end h-full"
              >
                {/* Tooltip - Sleek Floating Dark Glass */}
                <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col p-3 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-xl z-50 text-xs w-48 pointer-events-none backdrop-blur">
                  <div className="font-bold flex justify-between text-slate-100">
                    <span>Day {d.day}</span>
                    <span className="text-slate-400 font-normal">{d.date}</span>
                  </div>
                  <div className="mt-1 text-emerald-400 font-bold">
                    Net: {formatCurrency(d.predicted)}
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Cumulative: {formatCurrency(d.cumulative)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Band: {formatCurrency(d.lower)} - {formatCurrency(d.upper)}
                  </div>
                  {showSubmodels && (
                    <div className="mt-1 pt-1 border-t border-slate-700 text-[10px] space-y-0.5">
                      <div className="text-purple-300">XGBoost: {formatCurrency(d.xgbPred)}</div>
                      <div className="text-blue-300">LightGBM: {formatCurrency(d.lgbPred)}</div>
                      <div className="text-amber-300">EMA: {formatCurrency(d.emaPred)}</div>
                    </div>
                  )}
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    isPos
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 opacity-90 group-hover:opacity-100 shadow-sm shadow-emerald-500/20'
                      : 'bg-gradient-to-t from-rose-600 to-pink-500 opacity-90 group-hover:opacity-100 shadow-sm shadow-rose-500/20'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-slate-500 px-2 font-medium">
          <span>Day 1 ({activeDailySlice[0]?.date})</span>
          <span>Day {Math.floor(selectedHorizon / 2)}</span>
          <span>Day {selectedHorizon} ({activeDailySlice[activeDailySlice.length - 1]?.date})</span>
        </div>
      </div>

      {/* AI Strategic Liquidity Insights - Clean Card Alerts */}
      {data?.insights && data.insights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Strategic Liquidity Advisory</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.insights.map((ins, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  ins.type === 'warning'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : ins.type === 'positive'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : ins.type === 'caution'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-blue-50/80 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {ins.type === 'warning' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                    {ins.type === 'positive' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {ins.type === 'caution' && <PieChart className="w-5 h-5 text-amber-600" />}
                    {ins.type === 'info' && <ShieldCheck className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900">{ins.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{ins.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horizon Comparison Cards & Feature Driver Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Horizon Outlook Matrix */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Multi-Horizon Forecast Comparison
            </h3>
            <span className="text-xs text-slate-500 font-medium">7d vs 14d vs 30d vs 90d</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {data?.horizons.map((hz) => (
              <div
                key={hz.horizon}
                onClick={() => setSelectedHorizon(hz.horizon)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedHorizon === hz.horizon
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{hz.label}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      hz.confidenceScore >= 75
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {hz.confidenceScore}% Conf
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Total Net:</span>
                  <span
                    className={`text-base font-bold ${
                      hz.totalNetCash >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(hz.totalNetCash)}
                  </span>
                </div>

                <div className="mt-1 flex items-baseline justify-between text-xs text-slate-500">
                  <span>Daily Avg:</span>
                  <span className="text-slate-800 font-semibold">{formatCurrency(hz.avgDailyNet)}/d</span>
                </div>

                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(hz.positiveDays / hz.horizon) * 100}%` }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
                <div className="mt-1.5 text-[11px] text-slate-500 flex justify-between font-medium">
                  <span className="text-emerald-700">{hz.positiveDays} positive days</span>
                  <span className="text-rose-700">{hz.negativeDays} negative days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Importance & Model Weights */}
        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            Top Predictive Feature Drivers
          </h3>
          <p className="text-xs text-slate-500">
            Feature split frequency from XGBoost stump estimators
          </p>

          <div className="space-y-3 pt-2">
            {data?.featureImportance.slice(0, 6).map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{feat.name}</span>
                  <span className="text-emerald-600">{feat.importance}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${feat.importance}%` }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 flex justify-between items-center font-medium">
            <span>Model Error (RMSE):</span>
            <span className="text-slate-900 font-bold">${data?.model.rmse || 0}</span>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Schedule Table - Pristine White Table */}
      <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Daily Liquidity Forecast Schedule ({selectedHorizon} Days)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed breakdown of predicted daily net cash, confidence intervals, and cumulative ledger run-rate
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition w-60 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Day</th>
                <th className="py-3.5 px-4">Target Date</th>
                <th className="py-3.5 px-4">Ensemble Net</th>
                <th className="py-3.5 px-4">Confidence Interval</th>
                <th className="py-3.5 px-4">Cumulative Position</th>
                {showSubmodels && (
                  <>
                    <th className="py-3.5 px-4 text-purple-700">XGBoost (45%)</th>
                    <th className="py-3.5 px-4 text-blue-700">LightGBM (35%)</th>
                    <th className="py-3.5 px-4 text-amber-700">EMA (20%)</th>
                  </>
                )}
                <th className="py-3.5 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDaily.map((row) => (
                <tr key={row.day} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-500">+{row.day}d</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">{row.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        row.predicted >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(row.predicted)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatCurrency(row.lower)} ~ {formatCurrency(row.upper)}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">
                    {formatCurrency(row.cumulative)}
                  </td>
                  {showSubmodels && (
                    <>
                      <td className="py-3 px-4 text-purple-700 font-medium">{formatCurrency(row.xgbPred)}</td>
                      <td className="py-3 px-4 text-blue-700 font-medium">{formatCurrency(row.lgbPred)}</td>
                      <td className="py-3 px-4 text-amber-700 font-medium">{formatCurrency(row.emaPred)}</td>
                    </>
                  )}
                  <td className="py-3 px-4 text-right">
                    {row.predicted >= 0 ? (
                      <span className="inline-flex items-center text-emerald-600 gap-1 font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Inflow
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-rose-600 gap-1 font-semibold">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        Outflow
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs text-slate-500 shadow-sm">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Need to adjust historical cash transactions or record new ledger entries?</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/payments"
            className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-4"
          >
            Go to Payments Ledger
          </Link>
          <span>•</span>
          <Link
            to="/expenses"
            className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-4"
          >
            Manage Operating Expenses
          </Link>
        </div>
      </div>
    </div>
  );
}
