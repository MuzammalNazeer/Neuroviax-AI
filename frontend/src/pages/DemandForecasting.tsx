import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Zap,
  BarChart3,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  Sliders,
  ChevronRight,
  Info,
  ShoppingCart,
  Brain,
  Cpu,
  GitBranch,
  Users,
  Coins,
  Percent,
} from 'lucide-react';

interface ProductForecast {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  costPrice: number;
  sellPrice: number;
  leadTimeDays: number;
  reorderPoint: number;
  safetyStock: number;
  branchName: string;
  modelType?: 'xgboost' | 'lstm' | 'ensemble';
  architecture?: {
    layerType?: string;
    lookbackWindow?: number;
    hiddenUnits?: number;
    activation?: string;
    trainingEpochs?: number;
    mseLoss?: number;
    learningRate?: number;
    ensembleWeights?: string;
  };
  metrics: {
    baseDailyVelocity: number;
    adjustedDailyDemand: number;
    trendSlopePercent: number;
    forecast7d: number;
    forecast14d: number;
    forecast30d: number;
    forecast7dRevenue?: number;
    forecast14dRevenue?: number;
    forecast30dRevenue?: number;
    forecast30dGrossProfit?: number;
    profitMarginPercent?: number;
    daysOfStockRemaining: number;
    stockoutDate: string | null;
    riskTier: 'critical' | 'high' | 'medium' | 'low';
    suggestedReorderQuantity: number;
    estimatedRestockCost: number;
  };
  customerMetrics?: {
    uniqueCustomersCount: number;
    repeatCustomersCount: number;
    customerRepeatRate: number;
    avgOrderValue: number;
  };
  featureImportance: Array<{
    dimension?: string;
    feature: string;
    weight: number;
    description: string;
  }>;
  confidenceScore: number;
  modelName: string;
  historySeries: Array<{ date: string; qty: number }>;
  futureDailyTrajectory: Array<{
    dayIndex: number;
    date: string;
    dayName: string;
    predicted: number;
    predictedRevenue?: number;
    lowerBound: number;
    upperBound: number;
  }>;
}

interface ForecastSummary {
  totalProductsScanned: number;
  totalProjected30dUnits: number;
  totalProjected30dRevenue?: number;
  totalProjected30dGrossProfit?: number;
  totalProjected7dRevenue?: number;
  totalProjected14dRevenue?: number;
  projectedProfitMargin?: number;
  totalRestockCapitalRequired: number;
  criticalStockoutsCount: number;
  highRiskCount: number;
  averageModelConfidence: number;
  modelArchitecture: string;
  modelSelected?: string;
  customerDataSummary?: {
    totalCustomers: number;
    activeBuyers: number;
    repeatCustomerRate: number;
  };
  topRevenueDrivers?: any[];
  topStockoutRisks: any[];
}

const DemandForecasting: React.FC = () => {
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [forecasts, setForecasts] = useState<ProductForecast[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'xgboost' | 'lstm' | 'ensemble'>('xgboost');
  const [chartMode, setChartMode] = useState<'revenue' | 'units'>('revenue');
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reordering, setReordering] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchForecastData = async (model = selectedModel) => {
    try {
      setLoading(true);
      const [summaryRes, forecastsRes] = await Promise.all([
        api.get('/ai/forecast/summary', { params: { model } }),
        api.get('/ai/forecast', { params: { model } }),
      ]);
      setSummary(summaryRes.data);
      const items: ProductForecast[] = forecastsRes.data.forecasts || [];
      setForecasts(items);
      if (items.length > 0 && !selectedSKU) {
        setSelectedSKU(items[0].sku);
      }
    } catch (err: any) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoading(false);
      setRecomputing(false);
    }
  };

  useEffect(() => {
    fetchForecastData(selectedModel);
  }, [selectedModel]);

  const handleModelChange = (model: 'xgboost' | 'lstm' | 'ensemble') => {
    setSelectedModel(model);
    fetchForecastData(model);
  };

  const handleRecompute = () => {
    setRecomputing(true);
    setTimeout(() => {
      fetchForecastData(selectedModel);
    }, 500);
  };

  const handleCreateRestockProposal = async (product: ProductForecast) => {
    setReordering(true);
    setActionSuccess(null);
    try {
      await api.post('/ai/recommendations/generate', { assistant: 'procurement' });
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.5 } });
      setActionSuccess(
        `Restock proposal for ${product.productName} (${product.metrics.suggestedReorderQuantity} ${product.unit}) routed to AI Recommendations for approval!`
      );
    } catch (err: any) {
      console.error('Failed to generate restock order:', err);
    } finally {
      setReordering(false);
    }
  };

  const activeProduct = forecasts.find((f) => f.sku === selectedSKU) || forecasts[0];

  // Filtering
  const filteredForecasts = forecasts.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (riskFilter === 'all') return true;
    if (riskFilter === 'critical_high') return ['critical', 'high'].includes(item.metrics.riskTier);
    return item.metrics.riskTier === riskFilter;
  });

  // Chart rendering calculations
  const historyPoints = (activeProduct?.historySeries || []).slice(-14);
  const futurePoints = (activeProduct?.futureDailyTrajectory || []).slice(0, 21);
  const unitPrice = Number(activeProduct?.sellPrice) || 1;

  const allYVals = chartMode === 'revenue'
    ? [
        ...historyPoints.map((p) => (p.qty || 0) * unitPrice),
        ...futurePoints.map((p) => p.predictedRevenue || ((p.upperBound || p.predicted || 0) * unitPrice)),
      ]
    : [
        ...historyPoints.map((p) => p.qty || 0),
        ...futurePoints.map((p) => p.upperBound || p.predicted || 0),
      ];

  const maxY = Math.max(...allYVals, chartMode === 'revenue' ? 500 : 5) * 1.15;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              XGBoost & Ensemble Regressor Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Sales Prediction & Revenue Forecast
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Autonomous Machine Learning models combining <strong>Sales Velocity + Customer Behavior + Product Pricing</strong> to project 7d, 14d, and 30d revenue forecasts and prevent retail stockouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRecompute}
              disabled={recomputing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-sm backdrop-blur"
            >
              <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
              Re-train Models
            </button>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              AI Recommendations
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Multi-Source Fusion Pipeline Cards ──────────────── */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">1. Sales Data Stream</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Past order velocity, rolling 7/14/30d moving averages, and growth momentum.
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">2. Customer Data Stream</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Repeat purchase cadence, active buyer cohorts, and customer order value.
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">3. Product & Price Stream</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Unit sell price, profit margin %, stock buffers, and supplier lead times.
              </div>
            </div>
          </div>
        </div>

        {/* ── Model Architecture Switcher ────────────────────── */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Active Forecasting Model:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/70">
            <button
              onClick={() => handleModelChange('xgboost')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'xgboost'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              XGBoost GBDT Regressor
            </button>

            <button
              onClick={() => handleModelChange('lstm')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'lstm'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              Deep Learning LSTM (RNN)
            </button>

            <button
              onClick={() => handleModelChange('ensemble')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'ensemble'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Hybrid Ensemble (XGBoost + LSTM)
            </button>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Metric Cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: 30-Day Revenue Forecast */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              30d Revenue Forecast
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              Rs {(summary?.totalProjected30dRevenue || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-emerald-600 mt-1">
              Rs {(summary?.totalProjected30dGrossProfit || 0).toLocaleString()} est. profit ({summary?.projectedProfitMargin || 0}% margin)
            </div>
          </div>
        </div>

        {/* Card 2: 30-Day Projected Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              30d Demand Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {(summary?.totalProjected30dUnits || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">units</span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              7d target: Rs {(summary?.totalProjected7dRevenue || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 3: Customer Cohort Repeat Affinity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-600" />
              Customer Loyalty
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {summary?.customerDataSummary?.repeatCustomerRate || 35}% <span className="text-xs font-normal text-slate-500">repeat</span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              {summary?.customerDataSummary?.activeBuyers || 0} active buyer cohorts
            </div>
          </div>
        </div>

        {/* Card 4: Restock Capital Required */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Restock Capital
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              Rs {(summary?.totalRestockCapitalRequired || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Required procurement capital
            </div>
          </div>
        </div>

        {/* Card 5: Stockout Warning */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Stockout Risk
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {summary?.criticalStockoutsCount || summary?.highRiskCount || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              SKUs facing stockout within lead time
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold underline hover:text-emerald-700 ml-4 shrink-0"
            >
              Review in Recommendations →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Workspace Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Product Forecast Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeProduct ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900">
                      {activeProduct.productName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {activeProduct.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Category: {activeProduct.category}</span>
                    <span>•</span>
                    <span>Lead Time: {activeProduct.leadTimeDays} days</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      Engine: {activeProduct.modelName}
                    </span>
                  </div>
                </div>

                {/* Risk Badge */}
                <div>
                  {activeProduct.metrics.riskTier === 'critical' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Critical Stockout ({activeProduct.metrics.daysOfStockRemaining}d left)
                    </span>
                  ) : activeProduct.metrics.riskTier === 'high' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      High Risk ({activeProduct.metrics.daysOfStockRemaining}d left)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Stable ({activeProduct.metrics.daysOfStockRemaining}d coverage)
                    </span>
                  )}
                </div>
              </div>

              {/* LSTM Architecture Card (When LSTM Selected) */}
              {selectedModel === 'lstm' && activeProduct.architecture && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-50 via-indigo-50 to-slate-50 p-4 rounded-xl border border-purple-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-purple-600" />
                      LSTM Neural Network Layer Specifications
                    </span>
                    <span className="font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                      Epochs: {activeProduct.architecture.trainingEpochs} · Loss: {activeProduct.architecture.mseLoss}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block">Lookback Window</span>
                      <strong className="text-slate-900">{activeProduct.architecture.lookbackWindow} Days</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block">Hidden Units</span>
                      <strong className="text-slate-900">{activeProduct.architecture.hiddenUnits} Memory Cells</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block">Gate Activations</span>
                      <strong className="text-slate-900">{activeProduct.architecture.activation}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block">Rollout Method</span>
                      <strong className="text-slate-900">Autoregressive T+30</strong>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 30-Day Predictive Trajectory Chart */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Time-Series Prediction & Trajectory
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setChartMode('revenue')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                          chartMode === 'revenue'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Revenue (₨)
                      </button>
                      <button
                        onClick={() => setChartMode('units')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                          chartMode === 'units'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Units (Qty)
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                        <span className="text-slate-600">History</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${chartMode === 'revenue' ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                        <span className="text-slate-600">
                          {selectedModel === 'lstm' ? 'LSTM' : selectedModel === 'ensemble' ? 'Ensemble' : 'XGBoost'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual SVG Chart */}
                <div className="h-56 w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 relative overflow-hidden flex flex-col justify-end">
                  <svg className="w-full h-40 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={chartMode === 'revenue' ? '#10b981' : '#6366f1'} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={chartMode === 'revenue' ? '#10b981' : '#6366f1'} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal reference gridlines */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeDasharray="2" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeDasharray="2" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeDasharray="2" strokeWidth="0.5" />

                    {/* Past history line (left 40% of graph) */}
                    {historyPoints.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={historyPoints
                          .map((p, idx) => {
                            const x = (idx / (historyPoints.length - 1)) * 40;
                            const rawVal = chartMode === 'revenue' ? (p.qty || 0) * unitPrice : (p.qty || 0);
                            const y = 90 - (rawVal / maxY) * 80;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    )}

                    {/* Vertical Dividing Line: Today */}
                    <line x1="40" y1="0" x2="40" y2="95" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3" />

                    {/* Future Prediction Line (from x=40 to 100) */}
                    {futurePoints.length > 1 && (
                      <polyline
                        fill="none"
                        stroke={chartMode === 'revenue' ? '#059669' : selectedModel === 'lstm' ? '#9333ea' : '#4f46e5'}
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={futurePoints
                          .map((p, idx) => {
                            const x = 40 + (idx / (futurePoints.length - 1)) * 60;
                            const rawVal = chartMode === 'revenue'
                              ? (p.predictedRevenue || (p.predicted || 0) * unitPrice)
                              : (p.predicted || 0);
                            const y = 90 - (rawVal / maxY) * 80;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    )}

                    {/* Shaded Forecast Confidence Area */}
                    {futurePoints.length > 1 && (
                      <polygon
                        fill="url(#forecastGradient)"
                        points={`
                          40,90
                          ${futurePoints
                            .map((p, idx) => {
                              const x = 40 + (idx / (futurePoints.length - 1)) * 60;
                              const rawVal = chartMode === 'revenue'
                                ? (p.predictedRevenue || (p.predicted || 0) * unitPrice)
                                : (p.predicted || 0);
                              const y = 90 - (rawVal / maxY) * 80;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          100,90
                        `}
                      />
                    )}
                  </svg>

                  {/* Chart X-Axis Labels */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-200">
                    <span>14 Days Ago (Historical Sales)</span>
                    <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Today ({chartMode === 'revenue' ? 'Peak Rs ' + Math.round(maxY).toLocaleString() : 'Max ' + Math.round(maxY) + ' units'})
                    </span>
                    <span>Next 21 Days ({chartMode === 'revenue' ? 'Projected Revenue' : 'Projected Demand'})</span>
                  </div>
                </div>
              </div>

              {/* Customer Cohort & Buying Affinity Banner */}
              <div className="p-3.5 bg-violet-50/80 rounded-xl border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-200/70 text-violet-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-violet-950">Customer Behavior & Repeat Affinity</div>
                    <div className="text-slate-600 text-[11px]">
                      {activeProduct.customerMetrics?.uniqueCustomersCount || 1} distinct buyers · {activeProduct.customerMetrics?.customerRepeatRate || 25}% repeat purchase rate
                    </div>
                  </div>
                </div>
                <div className="font-mono text-violet-800 bg-white px-2.5 py-1 rounded-lg border border-violet-200 text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Avg Order Value</span>
                  <strong>Rs {(activeProduct.customerMetrics?.avgOrderValue || (activeProduct.sellPrice * 2)).toLocaleString()}</strong>
                </div>
              </div>

              {/* 3-Way Metrics Breakdown (Demand Units + Revenue Forecast) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <div className="text-center p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    7-Day Forecast
                  </span>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    Rs {(activeProduct.metrics.forecast7dRevenue || activeProduct.metrics.forecast7d * activeProduct.sellPrice).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {activeProduct.metrics.forecast7d} {activeProduct.unit}
                  </div>
                </div>

                <div className="text-center p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    14-Day Forecast
                  </span>
                  <div className="text-lg font-extrabold text-indigo-600 mt-0.5">
                    Rs {(activeProduct.metrics.forecast14dRevenue || activeProduct.metrics.forecast14d * activeProduct.sellPrice).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {activeProduct.metrics.forecast14d} {activeProduct.unit}
                  </div>
                </div>

                <div className="text-center p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    30-Day Forecast
                  </span>
                  <div className="text-lg font-extrabold text-emerald-600 mt-0.5">
                    Rs {(activeProduct.metrics.forecast30dRevenue || activeProduct.metrics.forecast30d * activeProduct.sellPrice).toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">
                    +Rs {(activeProduct.metrics.forecast30dGrossProfit || 0).toLocaleString()} profit ({activeProduct.metrics.profitMarginPercent || 25}%)
                  </div>
                </div>
              </div>

              {/* Explainable AI (XAI) Feature Importance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    Model Feature Importance & Rationale
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Confidence: {Math.round(activeProduct.confidenceScore * 100)}%
                  </span>
                </div>

                <div className="space-y-2">
                  {activeProduct.featureImportance.map((feat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{feat.feature}</span>
                        <span className="text-slate-500 font-mono font-bold">{feat.weight}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0
                              ? 'bg-indigo-600'
                              : idx === 1
                              ? 'bg-purple-500'
                              : idx === 2
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${feat.weight}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400">{feat.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation Box */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Recommended Reorder Action
                  </div>
                  <div className="text-sm text-slate-700">
                    Order <strong className="text-slate-900">{activeProduct.metrics.suggestedReorderQuantity} {activeProduct.unit}</strong>{' '}
                    (Est. Rs {activeProduct.metrics.estimatedRestockCost.toLocaleString()}) before stockout on{' '}
                    <strong className="text-rose-600 font-mono">{activeProduct.metrics.stockoutDate || 'near term'}</strong>.
                  </div>
                </div>

                <button
                  onClick={() => handleCreateRestockProposal(activeProduct)}
                  disabled={reordering}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shrink-0"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {reordering ? 'Generating PO...' : 'Draft Restock PO'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select a product to view the predictive forecast.
            </div>
          )}
        </div>

        {/* Right Column: SKU Forecast Catalog & Quick Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Package className="w-4 h-4 text-indigo-600" />
                Product Forecast Catalog
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {filteredForecasts.length} SKU{filteredForecasts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { key: 'all', label: 'All' },
                { key: 'critical_high', label: 'High Risk' },
                { key: 'medium', label: 'Medium' },
                { key: 'low', label: 'Safe' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setRiskFilter(pill.key)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    riskFilter === pill.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            {/* List of Products */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredForecasts.map((item) => {
                const isSelected = selectedSKU === item.sku;
                return (
                  <div
                    key={item.sku}
                    onClick={() => setSelectedSKU(item.sku)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {item.productName}
                        </div>
                        <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                      </div>

                      {item.metrics.riskTier === 'critical' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                          Critical
                        </span>
                      ) : item.metrics.riskTier === 'high' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                          High Risk
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          Safe
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Stock: </span>
                        <strong className="text-slate-800">{item.currentStock}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">14d: </span>
                        <strong className="text-indigo-600">{item.metrics.forecast14d} {item.unit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">30d Rev: </span>
                        <strong className="text-emerald-700 font-semibold">
                          Rs {(item.metrics.forecast30dRevenue || item.metrics.forecast30d * item.sellPrice).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemandForecasting;
