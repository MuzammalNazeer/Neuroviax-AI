import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  Package,
  CreditCard,
  Search,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  BarChart2,
  ChevronRight,
  TrendingDown,
  Clock,
  Warehouse,
  Coins,
  FileSpreadsheet,
  Brain,
  Network,
  Bot,
  Ban,
  ShoppingCart,
} from 'lucide-react';

interface FeatureContribution {
  featureIndex: number;
  featureName: string;
  value: number;
  zScore: number;
  avgSplitDepth: number;
  percentage: number;
}

interface AnomalyItem {
  id: string;
  entityType: 'Payment' | 'Order' | 'Inventory';
  domain: 'transactions' | 'inventory';
  title: string;
  party: string;
  amount: number;
  method?: string;
  status: 'investigating' | 'resolved' | 'false_positive';
  date: string;
  anomalyScore: number;
  iforestScore?: number;
  autoencoderScore?: number;
  autoencoderMse?: number;
  meanPathLength: number;
  cPsi: number;
  isAnomaly: boolean;
  riskTier: 'critical' | 'high' | 'medium' | 'low';
  threshold: number;
  contributions: FeatureContribution[];
  flaggedBy?: string;
  anomalyType: string;
  suggestedAction: string;
  actionLabel: string;
  rationale: string;
  primaryDriver: string;
  varianceQty?: number;
  shrinkageExposure?: number;
  resolutionNotes?: string;
  resolvedAt?: string;
}

interface ScoreDistributionBin {
  range: string;
  count: number;
  color: string;
}

interface AnomalyDetectionResponse {
  generatedAt: string;
  domain: 'transactions' | 'orders' | 'inventory' | 'all';
  model: {
    name: string;
    ensembleTrees: number;
    autoencoderLayers?: string;
    contaminationRate: number;
    engineUsed?: string;
    algorithm: string;
    scoreFormula: string;
  };
  metrics: {
    totalEvaluated: number;
    anomaliesDetected: number;
    criticalAnomalies: number;
    highAnomalies: number;
    mediumAnomalies: number;
    suspiciousPayments?: number;
    suspiciousOrders?: number;
    totalFraudExposure: number;
    totalShrinkageLoss: number;
    averageIsolationDepth: number;
    averageReconstructionLoss?: number;
  };
  scoreDistribution: ScoreDistributionBin[];
  anomalies: AnomalyItem[];
  allRecords: AnomalyItem[];
}

export default function AnomalyDetection() {
  const [data, setData] = useState<AnomalyDetectionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [domainFilter, setDomainFilter] = useState<'all' | 'transactions' | 'orders' | 'inventory'>('all');
  const [engineFilter, setEngineFilter] = useState<'hybrid' | 'iforest' | 'autoencoder'>('hybrid');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [contamination, setContamination] = useState<number>(0.08);
  const [nTrees, setNTrees] = useState<number>(100);
  const [autoAlert, setAutoAlert] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState<string>('');

  const fetchAnomalies = async (isScan = false) => {
    if (isScan) setScanning(true);
    else setLoading(true);

    try {
      const res = await api.get('/anomalies/detect', {
        params: {
          domain: domainFilter === 'orders' ? 'orders' : domainFilter,
          engine: engineFilter,
          contamination,
          nTrees,
          autoAlert,
        },
      });
      setData(res.data);
      if (isScan) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      console.error('Failed to run Anomaly Detection:', err);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [domainFilter, engineFilter, contamination, nTrees]);

  const handleResolveAction = async (anomaly: AnomalyItem, actionType: string) => {
    setResolvingId(anomaly.id);
    try {
      const res = await api.post('/anomalies/resolve', {
        anomalyId: anomaly.id,
        domain: anomaly.domain,
        action: actionType,
        resolutionNotes: resolutionNoteInput || `Mitigation triggered from Anomaly Console`,
      });

      setActionSuccessMsg(res.data?.message || 'Action executed successfully.');
      setTimeout(() => setActionSuccessMsg(null), 5000);

      // Optimistically update item
      setData((prev) => {
        if (!prev) return prev;
        const updatedAnomalies = prev.anomalies.map((a) => {
          if (a.id === anomaly.id) {
            return {
              ...a,
              status: (actionType === 'mark_false_positive' ? 'false_positive' : 'resolved') as any,
              resolutionNotes: resolutionNoteInput || 'Resolved',
            };
          }
          return a;
        });
        return { ...prev, anomalies: updatedAnomalies };
      });

      if (selectedAnomaly?.id === anomaly.id) {
        setSelectedAnomaly((prev) =>
          prev
            ? {
                ...prev,
                status: (actionType === 'mark_false_positive' ? 'false_positive' : 'resolved') as any,
              }
            : null
        );
      }
      setResolutionNoteInput('');
    } catch (err: any) {
      console.error('Error resolving anomaly:', err);
    } finally {
      setResolvingId(null);
    }
  };

  // Filter anomalies based on search, domain, and risk
  const filteredAnomalies = useMemo(() => {
    if (!data?.anomalies) return [];
    return data.anomalies.filter((item) => {
      let matchDomain = true;
      if (domainFilter === 'transactions') matchDomain = item.entityType === 'Payment';
      else if (domainFilter === 'orders') matchDomain = item.entityType === 'Order';
      else if (domainFilter === 'inventory') matchDomain = item.entityType === 'Inventory';

      const matchRisk = riskFilter === 'all' || item.riskTier === riskFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.anomalyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryDriver.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchRisk && matchSearch;
    });
  }, [data?.anomalies, domainFilter, riskFilter, searchQuery]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* ── Top Executive Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Hybrid Shield: Isolation Forest + Deep Autoencoder Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Fraud & Transaction Anomaly Shield
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Ensemble AI combining <strong>Isolation Forest</strong> (orthogonal space partitioning) with a <strong>Deep Autoencoder</strong> (neural reconstruction loss) to pinpoint <strong>Suspicious Payments</strong>, <strong>Tampered Orders</strong>, and <strong>Inventory Shrinkage</strong> in real time.
            </p>
          </div>

          {/* Model Engine Selector & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Engine switcher */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15 flex items-center gap-1 text-xs">
              <button
                onClick={() => setEngineFilter('hybrid')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  engineFilter === 'hybrid'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Isolation Forest (50%) + Autoencoder (50%)"
              >
                🌲+🧠 Hybrid Ensemble
              </button>
              <button
                onClick={() => setEngineFilter('autoencoder')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  engineFilter === 'autoencoder'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Deep Autoencoder Neural Reconstruction Error Only"
              >
                🧠 Autoencoder
              </button>
              <button
                onClick={() => setEngineFilter('iforest')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  engineFilter === 'iforest'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Isolation Forest Tree Partitioning Only"
              >
                🌲 iForest
              </button>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Sensitivity:</span>
              <span className="font-bold text-amber-300">{Math.round(contamination * 100)}%</span>
              <input
                type="range"
                min="0.02"
                max="0.20"
                step="0.01"
                value={contamination}
                onChange={(e) => setContamination(parseFloat(e.target.value))}
                className="w-16 accent-amber-400 cursor-pointer"
                title="Model sensitivity rate"
              />
            </div>

            <button
              onClick={() => fetchAnomalies(true)}
              disabled={scanning}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/40 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Neural Re-evaluating...' : 'Run Real-Time Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </motion.div>
      )}

      {/* ── KPI Summary Metric Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Records Evaluated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Records Evaluated
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.metrics?.totalEvaluated || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <span>{nTrees} iTrees</span>
              <span>•</span>
              <span>Autoencoder 16➔6</span>
            </div>
          </div>
        </div>

        {/* Card 2: Suspicious Payments */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-rose-600" />
              Suspicious Payments
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-600">
              {data?.metrics?.suspiciousPayments || (data?.anomalies.filter((a) => a.entityType === 'Payment').length) || 0}
            </div>
            <div className="text-xs font-medium text-rose-600 mt-1">
              Card velocity bursts & off-hours 3 AM spikes
            </div>
          </div>
        </div>

        {/* Card 3: Suspicious Orders */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
              Suspicious Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.metrics?.suspiciousOrders || (data?.anomalies.filter((a) => a.entityType === 'Order').length) || 0}
            </div>
            <div className="text-xs font-medium text-amber-700 mt-1">
              Cart price tampering & reservation bot bursts
            </div>
          </div>
        </div>

        {/* Card 4: Shrinkage Loss Exposure */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-purple-600" />
              Shrinkage Exposure
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              Rs {(data?.metrics?.totalShrinkageLoss || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-purple-700 mt-1">
              Phantom stock loss & abnormal write-offs
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Spectrum & Dual-Engine Telemetry ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spectrum Histogram Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Hybrid Anomaly Score Spectrum (0.0 to 1.0)
              </h2>
              <p className="text-xs text-slate-500">
                Combined distribution: Tree path isolation depth + Autoencoder neural reconstruction loss
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              Avg Reconstruction Loss: {data?.metrics?.averageReconstructionLoss || '0.13'} MSE
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-4">
            {data?.scoreDistribution?.map((bin, idx) => {
              const maxCount = Math.max(...(data?.scoreDistribution?.map((b) => b.count) || [1]), 1);
              const heightPercent = Math.max(14, Math.round((bin.count / maxCount) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="h-32 w-full bg-slate-50 rounded-xl p-1.5 flex flex-col justify-end border border-slate-200 relative group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="w-full rounded-lg transition-all"
                      style={{ backgroundColor: bin.color, opacity: 0.9 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/80 backdrop-blur-xs rounded-xl transition-all">
                      <span className="text-xs font-bold text-white">{bin.count} items</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-center font-medium text-slate-600 leading-tight">
                    {bin.range}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{bin.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Telemetry Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Hybrid Model Telemetry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active configuration of Isolation Forest & Deep Autoencoder
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Model Architecture:</span>
                <span className="font-mono font-bold text-purple-700">iForest + Autoencoder</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Autoencoder Bottleneck:</span>
                <span className="font-mono font-bold text-slate-900">d ➔ 16 ➔ 6 ➔ 16 ➔ d</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">iTree Ensemble (t):</span>
                <span className="font-mono font-bold text-slate-900">{nTrees} Trees (ψ=256)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Ensemble Weighting:</span>
                <span className="font-mono font-bold text-emerald-600">50% Tree / 50% Neural</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Loss Function:</span>
                <span className="font-mono font-bold text-slate-900">MSE L(x, x̂) + Hill Scale</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
            <strong>💡 Hybrid Advantage:</strong> Isolation Forest catches rapid velocity spikes and off-hours extreme amounts, while the Deep Autoencoder catches subtle cart price tampering and multivariate feature drift.
          </div>
        </div>
      </div>

      {/* ── Category Domain Filter Tabs ───────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              domainFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>All Flagged ({data?.anomalies?.length || 0})</span>
          </button>

          <button
            onClick={() => setDomainFilter('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              domainFilter === 'transactions'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-500" />
            <span>Suspicious Payments ({data?.anomalies?.filter((a) => a.entityType === 'Payment').length || 0})</span>
          </button>

          <button
            onClick={() => setDomainFilter('orders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              domainFilter === 'orders'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
            <span>Suspicious Orders ({data?.anomalies?.filter((a) => a.entityType === 'Order').length || 0})</span>
          </button>

          <button
            onClick={() => setDomainFilter('inventory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              domainFilter === 'inventory'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5 text-purple-500" />
            <span>Inventory Shrinkage ({data?.anomalies?.filter((a) => a.entityType === 'Inventory').length || 0})</span>
          </button>
        </div>

        {/* Risk & Search Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['all', 'critical', 'high', 'medium'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setRiskFilter(tier)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all ${
                  riskFilter === tier
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search anomaly, party, order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Flagged Anomalies Feed ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>Showing {filteredAnomalies.length} Flagged Incidents</span>
          <span>Ranked by Hybrid Anomaly Score (Descending)</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Running Isolation Trees & Deep Autoencoder forward passes...</p>
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Anomalies Found in Filtered Range</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust the sensitivity slider or switch tabs to explore other categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAnomalies.map((anom) => {
              const isCritical = anom.riskTier === 'critical';
              const isHigh = anom.riskTier === 'high';
              const isResolved = anom.status === 'resolved' || anom.status === 'false_positive';

              return (
                <motion.div
                  key={anom.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    isResolved
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : isCritical
                      ? 'bg-white border-l-4 border-l-rose-500 border-slate-200 shadow-sm hover:shadow-md'
                      : isHigh
                      ? 'bg-white border-l-4 border-l-amber-500 border-slate-200 shadow-sm hover:shadow-md'
                      : 'bg-white border-l-4 border-l-purple-500 border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: Metadata & Rationale */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            isCritical
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isHigh
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {anom.riskTier} RISK
                        </span>

                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {anom.entityType === 'Order' ? (
                            <>
                              <ShoppingCart className="w-3 h-3 text-amber-600" />
                              SUSPICIOUS ORDER
                            </>
                          ) : anom.entityType === 'Payment' ? (
                            <>
                              <CreditCard className="w-3 h-3 text-rose-600" />
                              SUSPICIOUS PAYMENT
                            </>
                          ) : (
                            <>
                              <Package className="w-3 h-3 text-purple-600" />
                              INVENTORY SHRINKAGE
                            </>
                          )}
                        </span>

                        {anom.flaggedBy && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {anom.flaggedBy}
                          </span>
                        )}

                        {isResolved && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {anom.status.toUpperCase()}
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          {new Date(anom.date).toLocaleDateString()} {new Date(anom.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          {anom.anomalyType}
                          <span className="text-xs font-normal text-slate-500 font-mono">
                            ({anom.title})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          Entity: <span className="font-bold text-slate-800">{anom.party}</span> • Monetary Value:{' '}
                          <span className="font-black text-rose-600">
                            Rs {(anom.amount || anom.shrinkageExposure || 0).toLocaleString()}
                          </span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {anom.rationale}
                      </p>
                    </div>

                    {/* Middle: Dual Score Breakdown */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Final Hybrid</div>
                        <div
                          className={`text-2xl font-black font-mono ${
                            anom.anomalyScore >= 0.75
                              ? 'text-rose-600'
                              : anom.anomalyScore >= 0.60
                              ? 'text-amber-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {anom.anomalyScore.toFixed(3)}
                        </div>
                      </div>

                      <div className="h-10 w-[1px] bg-slate-200" />

                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[11px] text-slate-500">🌲 iForest:</span>
                          <span className="font-bold text-slate-900">
                            {anom.iforestScore !== undefined ? anom.iforestScore.toFixed(3) : anom.anomalyScore.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[11px] text-slate-500">🧠 Autoencoder:</span>
                          <span className="font-bold text-purple-700">
                            {anom.autoencoderScore !== undefined ? anom.autoencoderScore.toFixed(3) : '0.820'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedAnomaly(anom)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors w-full justify-center"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect Neural Loss</span>
                      </button>

                      {!isResolved ? (
                        <button
                          onClick={() => handleResolveAction(anom, anom.suggestedAction)}
                          disabled={resolvingId === anom.id}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm w-full justify-center disabled:opacity-50"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{resolvingId === anom.id ? 'Mitigating...' : anom.actionLabel}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          Action Executed
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Anomaly Detail & Neural Explanation Modal ────────────── */}
      <AnimatePresence>
        {selectedAnomaly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {selectedAnomaly.riskTier} RISK • {selectedAnomaly.entityType.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {selectedAnomaly.anomalyType}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Dual Scores Comparison */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="p-3 bg-white rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Isolation Forest Score</div>
                  <div className="text-xl font-black font-mono text-emerald-600 mt-0.5">
                    {selectedAnomaly.iforestScore !== undefined ? selectedAnomaly.iforestScore.toFixed(3) : selectedAnomaly.anomalyScore.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Mean path depth: {selectedAnomaly.meanPathLength}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Autoencoder Neural Score</div>
                  <div className="text-xl font-black font-mono text-purple-600 mt-0.5">
                    {selectedAnomaly.autoencoderScore !== undefined ? selectedAnomaly.autoencoderScore.toFixed(3) : '0.820'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">MSE Loss: {selectedAnomaly.autoencoderMse || '1.24'}</div>
                </div>
              </div>

              {/* Rationale Narrative */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Diagnostic Explainability
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedAnomaly.rationale}
                </p>
              </div>

              {/* Feature Drivers Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Primary Vector Impact Breakdown
                </h4>
                <div className="space-y-2">
                  {selectedAnomaly.contributions?.map((feat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{feat.featureName}</span>
                        <span className="font-mono text-slate-500">
                          {feat.percentage}% impact (Z-score: {feat.zScore})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                          style={{ width: `${feat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => handleResolveAction(selectedAnomaly, 'mark_false_positive')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition w-full sm:w-auto"
                >
                  Whitelist / False Positive
                </button>

                <button
                  onClick={() => handleResolveAction(selectedAnomaly, selectedAnomaly.suggestedAction)}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/20 transition flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Execute {selectedAnomaly.actionLabel}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
