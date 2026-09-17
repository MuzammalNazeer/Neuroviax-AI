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
  entityType: 'Payment' | 'Inventory';
  domain: 'transactions' | 'inventory';
  title: string;
  party: string;
  amount: number;
  method?: string;
  status: 'investigating' | 'resolved' | 'false_positive';
  date: string;
  anomalyScore: number;
  meanPathLength: number;
  cPsi: number;
  isAnomaly: boolean;
  riskTier: 'critical' | 'high' | 'medium' | 'low';
  threshold: number;
  contributions: FeatureContribution[];
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
  domain: 'transactions' | 'inventory' | 'all';
  model: {
    name: string;
    ensembleTrees: number;
    subSampleSize: number;
    contaminationRate: number;
    algorithm: string;
    scoreFormula: string;
  };
  metrics: {
    totalEvaluated: number;
    anomaliesDetected: number;
    criticalAnomalies: number;
    highAnomalies: number;
    mediumAnomalies: number;
    totalFraudExposure: number;
    totalShrinkageLoss: number;
    averageIsolationDepth: number;
  };
  scoreDistribution: ScoreDistributionBin[];
  anomalies: AnomalyItem[];
  allRecords: AnomalyItem[];
}

export default function AnomalyDetection() {
  const [data, setData] = useState<AnomalyDetectionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [domainFilter, setDomainFilter] = useState<'all' | 'transactions' | 'inventory'>('all');
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
          domain: domainFilter,
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
      console.error('Failed to run Isolation Forest detection:', err);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [domainFilter, contamination, nTrees]);

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
      const matchDomain = domainFilter === 'all' || item.domain === domainFilter;
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
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Isolation Forest (iForest v2.0) Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Anomaly Shield & Fraud Detection
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Unsupervised machine learning partitions operational vectors to isolate <strong>Payment Fraud</strong>, <strong>Velocity Attacks</strong>, <strong>Cart Tampering</strong>, and <strong>Inventory Stock Shrinkage</strong> before financial loss occurs.
            </p>
          </div>

          {/* Banner Quick Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Contamination:</span>
              <span className="font-bold text-amber-300">{Math.round(contamination * 100)}%</span>
              <input
                type="range"
                min="0.02"
                max="0.20"
                step="0.01"
                value={contamination}
                onChange={(e) => setContamination(parseFloat(e.target.value))}
                className="w-16 accent-amber-400 cursor-pointer"
                title="Model contamination rate"
              />
            </div>

            <button
              onClick={() => fetchAnomalies(true)}
              disabled={scanning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Partitioning iTrees...' : 'Run iForest Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Success Alert Toast */}
      <AnimatePresence>
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Executive Metric KPI Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vectors Scanned */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-600" />
              Scanned Vectors
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.metrics?.totalEvaluated || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Evaluated across {data?.model?.ensembleTrees || 100} Isolation Trees
            </div>
          </div>
        </div>

        {/* Card 2: Anomalies Flagged */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Anomalies Flagged
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-600">
              {data?.metrics?.anomaliesDetected || 0}
            </div>
            <div className="text-xs font-medium text-rose-600 mt-1">
              {data?.metrics?.criticalAnomalies || 0} critical • {data?.metrics?.highAnomalies || 0} high risk
            </div>
          </div>
        </div>

        {/* Card 3: Fraud Exposure */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              Fraud Exposure At Risk
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              Rs {(data?.metrics?.totalFraudExposure || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-amber-700 mt-1">
              Off-hours payments, bot bursts & cart tampered
            </div>
          </div>
        </div>

        {/* Card 4: Shrinkage Loss */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-purple-600" />
              Shrinkage & Stock Loss
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              Rs {(data?.metrics?.totalShrinkageLoss || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-purple-700 mt-1">
              Unreconciled phantom stock & abnormal write-offs
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Distribution Spectrum & Telemetry ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Histogram Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Isolation Score Spectrum (0.0 to 1.0)
              </h2>
              <p className="text-xs text-slate-500">
                Data partition frequency from normal dense records (score &lt; 0.5) to isolated outliers (score &ge; 0.65)
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              Avg Isolation Depth: {data?.metrics?.averageIsolationDepth || 0} / BST c(n) ~ 10.2
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

        {/* Telemetry Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Isolation Forest Telemetry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              IEEE ICDM random recursive hyperplane partitioning specifications
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Ensemble iTrees (t):</span>
                <span className="font-mono font-bold text-slate-900">{data?.model?.ensembleTrees || 100} trees</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Sub-sample Size (ψ):</span>
                <span className="font-mono font-bold text-slate-900">{data?.model?.subSampleSize || 256} vectors</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Max Height (h_max = ⌈log₂ψ⌉):</span>
                <span className="font-mono font-bold text-slate-900">8 depth levels</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Euler Constant (γ):</span>
                <span className="font-mono font-bold text-slate-900">0.577215</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">BST Normalizer c(ψ):</span>
                <span className="font-mono font-bold text-emerald-600">10.24 edges</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
            <span className="font-bold">Anomaly Criterion:</span> Outliers isolate near the tree roots with path lengths h(x) &lt;&lt; c(ψ), producing high anomaly scores s(x, ψ) &rarr; 1.0.
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Domain Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              domainFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unified All
          </button>
          <button
            onClick={() => setDomainFilter('transactions')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              domainFilter === 'transactions'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            Transactions & Fraud
          </button>
          <button
            onClick={() => setDomainFilter('inventory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              domainFilter === 'inventory'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-purple-600" />
            Inventory Shrinkage
          </button>
        </div>

        {/* Risk Filter & Search Input */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-slate-500 px-2 font-medium">Risk:</span>
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
              placeholder="Search anomaly, party, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Flagged Anomalies Feed ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>Showing {filteredAnomalies.length} Flagged Anomalies</span>
          <span>Ranked by iForest Anomaly Score (Descending)</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Fitting Isolation Trees and calculating outlier depths...</p>
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Anomalies Found in Filtered Range</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust the contamination sensitivity or switch domain tabs to explore other records.
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
                      : 'bg-white border-l-4 border-l-indigo-500 border-slate-200 shadow-sm hover:shadow-md'
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
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {anom.riskTier} RISK
                        </span>

                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {anom.domain === 'transactions' ? (
                            <>
                              <CreditCard className="w-3 h-3 text-indigo-600" />
                              TRANSACTION FRAUD
                            </>
                          ) : (
                            <>
                              <Package className="w-3 h-3 text-purple-600" />
                              INVENTORY SHRINKAGE
                            </>
                          )}
                        </span>

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
                          Entity: <span className="font-bold text-slate-800">{anom.party}</span> • Exposure Value:{' '}
                          <span className="font-black text-rose-600">
                            Rs {(anom.amount || anom.shrinkageExposure || 0).toLocaleString()}
                          </span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {anom.rationale}
                      </p>
                    </div>

                    {/* Middle: Score Gauge */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">iForest Score</div>
                        <div
                          className={`text-2xl font-black font-mono ${
                            anom.anomalyScore >= 0.75
                              ? 'text-rose-600'
                              : anom.anomalyScore >= 0.65
                              ? 'text-amber-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {anom.anomalyScore.toFixed(3)}
                        </div>
                      </div>

                      <div className="h-10 w-[1px] bg-slate-200" />

                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div>
                          Path Depth: <span className="font-mono font-bold text-slate-900">{anom.meanPathLength}</span>
                        </div>
                        <div>
                          Normalizer $c(n)$: <span className="font-mono text-slate-500">{anom.cPsi}</span>
                        </div>
                        <div className="text-[10px] text-rose-600 font-bold truncate max-w-[130px]">
                          Driver: {anom.primaryDriver}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => setSelectedAnomaly(anom)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Explain Root Cause
                      </button>

                      {!isResolved && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveAction(anom, anom.suggestedAction)}
                            disabled={resolvingId === anom.id}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            {resolvingId === anom.id ? 'Processing...' : anom.actionLabel}
                          </button>

                          <button
                            onClick={() => handleResolveAction(anom, 'mark_false_positive')}
                            disabled={resolvingId === anom.id}
                            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all"
                            title="Mark as safe false positive"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature Drivers Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Key Isolation Drivers:
                    </span>
                    {anom.contributions?.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <span className="text-slate-600 text-[11px] font-medium">{feat.featureName}:</span>
                        <span className="font-bold text-amber-700 font-mono text-[11px]">+{feat.percentage}%</span>
                        <span className="text-[10px] text-slate-400 font-mono">(z: {feat.zScore})</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Root Cause & Explainability Modal ────────────────────── */}
      <AnimatePresence>
        {selectedAnomaly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-800"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-black rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {selectedAnomaly.riskTier} ANOMALY
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{selectedAnomaly.title}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedAnomaly.anomalyType}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Isolation Metrics Box */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">iForest Score</div>
                  <div className="text-xl font-extrabold text-rose-600 font-mono">
                    {selectedAnomaly.anomalyScore}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Tree Isolation Depth</div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">
                    {selectedAnomaly.meanPathLength}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Expected Depth c(n)</div>
                  <div className="text-xl font-extrabold text-slate-700 font-mono">
                    {selectedAnomaly.cPsi}
                  </div>
                </div>
              </div>

              {/* SHAP Contribution Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Isolation Partition Contributions (SHAP Attribution)
                </h4>
                <div className="space-y-2.5">
                  {selectedAnomaly.contributions?.map((feat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-semibold">{feat.featureName}</span>
                        <span className="font-mono text-amber-700 font-bold">
                          {feat.percentage}% ({feat.value?.toLocaleString()})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${feat.percentage}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.05 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Z-Score: {feat.zScore}σ from merchant baseline</span>
                        <span>Average split depth: {feat.avgSplitDepth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale & Action Proposal */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Action Rationale & Explainability:</div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedAnomaly.rationale}</p>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add audit resolution notes..."
                    value={resolutionNoteInput}
                    onChange={(e) => setResolutionNoteInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleResolveAction(selectedAnomaly, selectedAnomaly.suggestedAction)}
                    disabled={resolvingId === selectedAnomaly.id}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Execute Mitigation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
