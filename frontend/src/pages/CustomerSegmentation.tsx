import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Users,
  Crown,
  HeartHandshake,
  AlertTriangle,
  Moon,
  Tag,
  Sparkles,
  RefreshCw,
  Search,
  DollarSign,
  Activity,
  Sliders,
  Send,
  MessageSquare,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  Flame,
  Coins,
} from 'lucide-react';

interface PurchaseBehavior {
  recencyDays: number;
  frequency: number;
  monetarySpend: number;
  averageOrderValue: number;
  averageBasketSize: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
}

interface CustomerRecord {
  _id: string;
  id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsappOptIn: boolean;
  clusterIndex: number;
  segmentKey: string;
  segmentName: string;
  segmentColor: string;
  segmentBadge: string;
  priorityTier: string;
  suggestedAction: string;
  suggestedCampaign: string;
  purchaseBehavior: PurchaseBehavior;
}

interface ClusterSummary {
  clusterId: number;
  segmentKey: string;
  segmentName: string;
  tagline: string;
  color: string;
  badge: string;
  badgeHex: string;
  icon: string;
  priorityTier: string;
  churnRisk: string;
  nextBestAction: string;
  suggestedCampaign: string;
  expectedUpsellImpact: string;
  memberCount: number;
  percentOfCustomers: number;
  totalRevenue: number;
  percentOfRevenue: number;
  metrics: {
    avgRecencyDays: number;
    avgFrequency: number;
    avgLifetimeSpend: number;
    avgOrderValue: number;
  };
}

interface ElbowPoint {
  k: number;
  inertia: number;
  silhouetteScore: number;
}

interface SegmentationData {
  meta: {
    algorithm: string;
    distanceMetric: string;
    k: number;
    iterations: number;
    converged: boolean;
    inertia: number;
    silhouetteScore: number;
    silhouetteInterpretation: string;
    totalCustomers: number;
    totalRevenue: number;
    analyzedAt: string;
  };
  metrics: {
    totalCustomers: number;
    totalRevenue: number;
    silhouetteScore: number;
    vipCustomerCount: number;
    vipRevenueShare: number;
    atRiskCustomerCount: number;
    atRiskRevenueAtStake: number;
  };
  clusters: ClusterSummary[];
  elbowCurve: ElbowPoint[];
  customers: CustomerRecord[];
}

export default function CustomerSegmentation() {
  const [data, setData] = useState<SegmentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clusteringK, setClusteringK] = useState(5);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scatterMode, setScatterMode] = useState<'recency_spend' | 'frequency_spend' | 'recency_frequency'>('recency_spend');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [activeCampaignModal, setActiveCampaignModal] = useState<ClusterSummary | null>(null);
  const [campaignMessage, setCampaignMessage] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSegmentation = async (kVal: number, refresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/customer-segmentation/cluster?k=${kVal}&refresh=${refresh}`);
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setError('Unable to load segmentation data. Please verify your connection.');
      }
    } catch (err: any) {
      console.error('Failed to load customer segmentation data:', err);
      setError(err?.response?.data?.message || err?.message || 'Error executing K-Means clustering');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentation(clusteringK);
  }, []);

  const handleRecluster = () => {
    fetchSegmentation(clusteringK, true);
  };

  const handleLaunchCampaign = async () => {
    if (!activeCampaignModal) return;
    setDispatching(true);
    try {
      const res = await api.post('/customer-segmentation/action', {
        segmentKey: activeCampaignModal.segmentKey,
        segmentName: activeCampaignModal.segmentName,
        actionType: 'whatsapp_campaign',
        discountPercent: parseInt(discountPercent, 10) || 15,
        customMessage: campaignMessage || activeCampaignModal.nextBestAction,
      });

      if (res.data?.success) {
        setDispatchSuccess(res.data.message || 'Campaign launched successfully!');
        confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          setDispatchSuccess(null);
          setActiveCampaignModal(null);
          setCampaignMessage('');
        }, 2200);
      }
    } catch (err) {
      console.error('Error dispatching campaign:', err);
    } finally {
      setDispatching(false);
    }
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    return data.customers.filter((c) => {
      const matchesSegment = selectedSegmentKey === 'all' || c.segmentKey === selectedSegmentKey;
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery)) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSegment && matchesSearch;
    });
  }, [data, selectedSegmentKey, searchQuery]);

  // Scatter plot points normalization
  const scatterPoints = useMemo(() => {
    if (!data || !data.customers.length) return [];

    let maxX = 1;
    let maxY = 1;

    data.customers.forEach((c) => {
      let xVal = c.purchaseBehavior.recencyDays;
      let yVal = c.purchaseBehavior.monetarySpend;

      if (scatterMode === 'frequency_spend') {
        xVal = c.purchaseBehavior.frequency;
        yVal = c.purchaseBehavior.monetarySpend;
      } else if (scatterMode === 'recency_frequency') {
        xVal = c.purchaseBehavior.recencyDays;
        yVal = c.purchaseBehavior.frequency;
      }

      if (xVal > maxX) maxX = xVal;
      if (yVal > maxY) maxY = yVal;
    });

    return data.customers.map((c) => {
      let xVal = c.purchaseBehavior.recencyDays;
      let yVal = c.purchaseBehavior.monetarySpend;

      if (scatterMode === 'frequency_spend') {
        xVal = c.purchaseBehavior.frequency;
        yVal = c.purchaseBehavior.monetarySpend;
      } else if (scatterMode === 'recency_frequency') {
        xVal = c.purchaseBehavior.recencyDays;
        yVal = c.purchaseBehavior.frequency;
      }

      const xPct = 6 + (xVal / maxX) * 88;
      const yPct = 94 - (yVal / maxY) * 86;

      return {
        customer: c,
        xPct,
        yPct,
        rawX: xVal,
        rawY: yVal,
      };
    });
  }, [data, scatterMode]);

  const getSegmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown className="w-4 h-4 text-emerald-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-blue-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-slate-600" />;
      default:
        return <Tag className="w-4 h-4 text-pink-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Hallmark Neuroviax AI Deep Dark Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border border-slate-800 p-6 md:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Machine Learning Engine · K-Means++ Clustering
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Customer Segmentation Cockpit
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Unsupervised multi-dimensional purchase behavior clustering across Recency, Frequency, Monetary Spend, and Basket Value. Convert customer signals into automated ABOP marketing interventions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 shadow-inner">
              <span className="text-xs text-slate-400 mr-2 font-mono">Clusters (K):</span>
              <span className="text-sm font-bold text-emerald-400 mr-3 w-4">{clusteringK}</span>
              <input
                type="range"
                min="2"
                max="6"
                value={clusteringK}
                onChange={(e) => setClusteringK(parseInt(e.target.value, 10))}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRecluster}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-Cluster
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" />
            ))}
          </div>
          <div className="h-72 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-bold text-slate-800">Running K-Means++ Clustering Engine...</p>
            <p className="text-xs text-slate-500">Vectorizing purchase behaviors across RFM feature space</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <p className="text-xs text-rose-700 mt-0.5">Please verify backend server status and refresh.</p>
            </div>
          </div>
          <button
            onClick={() => fetchSegmentation(clusteringK, true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Clean, Crisp Executive KPI Cards matching Neuroviax App Theme */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase">
                Total Customers
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-3 font-mono">
              {data.metrics.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">100% vectorized in purchase feature space</p>
          </div>

          {/* Card 2: Silhouette Quality */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 uppercase">
                Silhouette Score
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {data.metrics.silhouetteScore.toFixed(3)}
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                {data.meta.silhouetteInterpretation.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Mathematical cluster cohesion & separation</p>
          </div>

          {/* Card 3: VIP Concentration */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 uppercase">
                VIP Revenue Share
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {data.metrics.vipRevenueShare}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({data.metrics.vipCustomerCount} VIPs)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">High-value customer concentration</p>
          </div>

          {/* Card 4: At-Risk Churn Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 uppercase">
                At-Risk Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 mt-3 font-mono">
              ₨ {data.metrics.atRiskRevenueAtStake.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.metrics.atRiskCustomerCount} high spenders slipping away
            </p>
          </div>
        </div>
      )}

      {/* 3. 2D Purchase Behavior Cluster Map & Model Diagnostics */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scatter Plot Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Purchase Behavior Cluster Map (2D Projection)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Interactive coordinates of customer purchase vectors colored by assigned K-Means cluster.
                  </p>
                </div>

                {/* Axis Selector Bar */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
                  <button
                    onClick={() => setScatterMode('recency_spend')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      scatterMode === 'recency_spend'
                        ? 'bg-white text-emerald-700 font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Recency vs. Spend
                  </button>
                  <button
                    onClick={() => setScatterMode('frequency_spend')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      scatterMode === 'frequency_spend'
                        ? 'bg-white text-emerald-700 font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Frequency vs. Spend
                  </button>
                  <button
                    onClick={() => setScatterMode('recency_frequency')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      scatterMode === 'recency_frequency'
                        ? 'bg-white text-emerald-700 font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Recency vs. Freq
                  </button>
                </div>
              </div>

              {/* High-Tech Dark Cyber Canvas for Clear Point Visual Distinction */}
              <div className="relative w-full h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden my-2 shadow-inner">
                {/* Subtle Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-25">
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-r border-slate-800" />
                  <div className="border-b border-slate-800" />
                </div>

                {/* Axis Labels */}
                <div className="absolute top-2.5 left-3.5 text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  Y: {scatterMode === 'recency_frequency' ? 'Frequency (Orders)' : 'Monetary Spend (PKR)'} ↑
                </div>
                <div className="absolute bottom-2.5 right-3.5 text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  X: {scatterMode === 'frequency_spend' ? 'Frequency (Orders)' : 'Recency (Days Ago)'} →
                </div>

                {/* Plot Points */}
                {scatterPoints.map(({ customer, xPct, yPct }) => (
                  <div
                    key={customer._id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-transform duration-150 hover:scale-150 hover:z-30"
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white/40 shadow-md transition-all group-hover:ring-4 group-hover:ring-white/40"
                      style={{ backgroundColor: customer.segmentColor }}
                    />
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-2xl border border-slate-700 z-40 transition-opacity font-mono">
                      <p className="font-bold text-emerald-300">{customer.name}</p>
                      <p className="text-slate-200">{customer.segmentName}</p>
                      <p className="text-slate-400">
                        Spend: ₨ {customer.purchaseBehavior.monetarySpend.toLocaleString()} · Rec: {customer.purchaseBehavior.recencyDays}d
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scatter Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Cluster Legend:</span>
              {data.clusters.map((c) => (
                <div key={c.clusterId} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium text-slate-700">{c.segmentName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Diagnostics Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Elbow Curve & Diagnostics
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  WCSS Inertia
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Validates cluster optimal count $K$ where marginal decrease in WCSS inertia diminishes.
              </p>

              {/* Elbow Bars */}
              <div className="space-y-2.5">
                {data.elbowCurve.map((point) => {
                  const isCurrent = point.k === data.meta.k;
                  const maxInertia = data.elbowCurve[0]?.inertia || 1;
                  const pct = Math.max(12, Math.min(100, (point.inertia / maxInertia) * 100));

                  return (
                    <div
                      key={point.k}
                      onClick={() => {
                        setClusteringK(point.k);
                        fetchSegmentation(point.k);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${isCurrent ? 'text-emerald-800' : 'text-slate-800'}`}>
                            K = {point.k}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-slate-500">WCSS: {point.inertia}</span>
                          <span className="text-purple-700 font-semibold">Sil: {point.silhouetteScore}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCurrent ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">Mathematical Rigor:</span> K-Means++ initialization optimizes centroid dispersion with $O(\log k)$ performance guarantee.
            </div>
          </div>
        </div>
      )}

      {/* 4. Segment Persona Cards Grid */}
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Identified Customer Segments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic classification derived from multi-dimensional purchase centroids.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {data.clusters.length} Segments Discovered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.clusters.map((segment) => (
              <div
                key={segment.clusterId}
                className="bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm"
                        style={{
                          backgroundColor: `${segment.color}15`,
                          borderColor: `${segment.color}35`,
                        }}
                      >
                        {getSegmentIcon(segment.icon)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {segment.segmentName}
                        </h4>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {segment.tagline}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${segment.badge}`}>
                      {segment.priorityTier.split(' - ')[0]}
                    </span>
                  </div>

                  {/* Segment Stats Matrix */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Customers</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {segment.memberCount} ({segment.percentOfCustomers}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Revenue</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        ₨ {segment.totalRevenue.toLocaleString()} ({segment.percentOfRevenue}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Avg Recency</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {segment.metrics.avgRecencyDays} days ago
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Avg Frequency</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {segment.metrics.avgFrequency} orders
                      </span>
                    </div>
                  </div>

                  {/* Next Best Action Banner */}
                  <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      ABOP AI Next Best Action:
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {segment.nextBestAction}
                    </p>
                  </div>
                </div>

                {/* Campaign Action Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-600 font-medium">
                    {segment.expectedUpsellImpact}
                  </span>
                  <button
                    onClick={() => {
                      setActiveCampaignModal(segment);
                      setCampaignMessage(`Exclusive offer for our valued ${segment.segmentName}: Enjoy an instant ${discountPercent}% discount on your next order!`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Send className="w-3 h-3 text-emerald-400" />
                    Launch Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Customer Roster Explorer Table */}
      {data && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Customer Purchase Roster
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore vectorized purchase metrics and trigger individual customer interventions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Segment Filter Pills */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs overflow-x-auto">
                <button
                  onClick={() => setSelectedSegmentKey('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedSegmentKey === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({data.customers.length})
                </button>
                {data.clusters.map((c) => (
                  <button
                    key={c.clusterId}
                    onClick={() => setSelectedSegmentKey(c.segmentKey)}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                      selectedSegmentKey === c.segmentKey
                        ? 'bg-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    style={{
                      color: selectedSegmentKey === c.segmentKey ? c.color : undefined,
                    }}
                  >
                    {c.segmentName}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          {/* Clean Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">Recency</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Total Spend</th>
                  <th className="py-3 px-4">Avg Order Value</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.slice(0, 25).map((cust) => (
                  <tr
                    key={cust._id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{cust.name}</span>
                        {cust.segmentKey === 'vip_champions' && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {cust.email || cust.phone || 'No contact'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cust.segmentBadge}`}>
                        {cust.segmentName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      <span className={cust.purchaseBehavior.recencyDays > 60 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                        {cust.purchaseBehavior.recencyDays}d ago
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {cust.purchaseBehavior.frequency} orders
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₨ {cust.purchaseBehavior.monetarySpend.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ₨ {cust.purchaseBehavior.averageOrderValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {cust.whatsappOptIn ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Opted-in
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Opted-out</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Profile & Intervene"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCustomers.length > 25 && (
            <div className="text-center text-xs text-slate-500 pt-2">
              Showing top 25 of {filteredCustomers.length} customers. Refine filters above for specific sub-cohorts.
            </div>
          )}
        </div>
      )}

      {/* 6. Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${selectedCustomer.segmentBadge}`}>
                    {selectedCustomer.segmentName}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedCustomer.email} · {selectedCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 my-5 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Lifetime Spend</span>
                  <span className="text-lg font-bold text-emerald-700 font-mono">
                    ₨ {selectedCustomer.purchaseBehavior.monetarySpend.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Recency</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {selectedCustomer.purchaseBehavior.recencyDays} days ago
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Order Frequency</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {selectedCustomer.purchaseBehavior.frequency} orders
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Average Basket Size</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {selectedCustomer.purchaseBehavior.averageBasketSize} items
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs mb-5">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                  Automated Next Best Action
                </span>
                <p className="text-slate-800 leading-relaxed text-[11px]">
                  {selectedCustomer.suggestedAction}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const message = `Hello ${selectedCustomer.name}! We noticed you appreciate our quality. Here is an exclusive 15% discount for your next order: VIP15`;
                    if (selectedCustomer.phone) {
                      window.open(`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                    } else {
                      alert('No phone number on record for this customer.');
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Dispatch WhatsApp Direct
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Campaign Dispatch Modal */}
      <AnimatePresence>
        {activeCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Targeted Campaign: {activeCampaignModal.segmentName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reach {activeCampaignModal.memberCount} customers via automated WhatsApp & Email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCampaignModal(null)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {dispatchSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-slate-900">Campaign Dispatched!</h4>
                  <p className="text-xs text-slate-500">{dispatchSuccess}</p>
                </div>
              ) : (
                <div className="space-y-4 my-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Promotional Discount (%)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Campaign Message Content
                    </label>
                    <textarea
                      rows={3}
                      value={campaignMessage}
                      onChange={(e) => setCampaignMessage(e.target.value)}
                      placeholder="Write message to send..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Target Audience Impact
                    </span>
                    <p className="text-slate-700 text-[11px]">
                      Expected Impact: <span className="text-emerald-700 font-bold">{activeCampaignModal.expectedUpsellImpact}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleLaunchCampaign}
                      disabled={dispatching}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {dispatching ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Execute ABOP Campaign
                    </button>
                    <button
                      onClick={() => setActiveCampaignModal(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
