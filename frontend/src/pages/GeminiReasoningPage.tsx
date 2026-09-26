import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SEO from '../components/SEO';
import {
  Brain,
  Database,
  TrendingUp,
  Package,
  DollarSign,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  RefreshCw,
  Send,
  Sliders,
  HelpCircle,
  Activity,
  Cpu,
  Workflow,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface TripartiteData {
  businessId: string;
  inventory: {
    domain: string;
    dataSource: string;
    totalSKUs: number;
    totalStockUnits: number;
    totalValuation: number;
    statusBreakdown: {
      healthy: number;
      lowStock: number;
      outOfStock: number;
    };
    criticalItems: any[];
    supplierCount: number;
    avgLeadTimeDays: number;
  };
  sales: {
    domain: string;
    dataSource: string;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    aov: number;
    topSellers: any[];
    fulfillmentRate: number;
  };
  finance: {
    domain: string;
    dataSource: string;
    totalInflows: number;
    totalExpenses: number;
    netProfit: number;
    netMarginPercent: number;
    liquidWorkingCapital: number;
    estimatedMonthlyBurn: number;
    cashRunwayMonths: number;
    receivablesPending: number;
  };
}

interface ReasoningResult {
  source: string;
  model: string;
  note?: string;
  executiveSummary: string;
  tripartiteHealthScore: number;
  confidenceScore: number;
  reasoningPillars: {
    inventoryHealth: string;
    salesMomentum: string;
    financialResilience: string;
  };
  crossDomainInsights: Array<{
    title: string;
    severity: 'positive' | 'warning' | 'critical';
    domainIntersection: string[];
    description: string;
    metricHighlight: string;
  }>;
  prescriptiveActions: Array<{
    priority: number;
    title: string;
    domainTarget: string;
    impact: string;
    actionType: string;
    estimatedROI: string;
    timeline: string;
  }>;
}

const PRESET_SCENARIOS = [
  'What happens to cash runway if supplier lead time increases by 7 days?',
  'If sales volume surges 30% next month, which SKUs trigger critical stockouts?',
  'Can our current working capital buffer absorb a $10,000 bulk inventory reorder?',
  'How do we maximize net profit margin given current operating expenses?',
];

const GeminiReasoningPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [tripartiteData, setTripartiteData] = useState<TripartiteData | null>(null);
  const [reasoning, setReasoning] = useState<ReasoningResult | null>(null);
  const [modelUsed, setModelUsed] = useState('gemini-3.8-flash');
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [scenarioInput, setScenarioInput] = useState('');
  const [executedActions, setExecutedActions] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'architecture'>('overview');
  const [configStatus, setConfigStatus] = useState<any>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [res, statusRes] = await Promise.all([
        api.get('/ai/gemini-reasoning/overview'),
        api.get('/ai/gemini-reasoning/status'),
      ]);
      if (res.data?.success) {
        setTripartiteData(res.data.data);
        setReasoning(res.data.reasoning);
        setModelUsed(res.data.modelUsed || 'gemini-3.8-flash');
        setIsLiveApi(res.data.isLiveApi || false);
        setLatencyMs(res.data.executionTimeMs || 90);
      }
      if (statusRes.data?.success) {
        setConfigStatus(statusRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch Gemini Tripartite Overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleAskScenario = async (promptText?: string) => {
    const q = promptText || scenarioInput;
    if (!q.trim()) return;

    setAsking(true);
    try {
      const res = await api.post('/ai/gemini-reasoning/ask', {
        question: q,
      });
      if (res.data?.success) {
        setReasoning(res.data.reasoning);
        setModelUsed(res.data.modelUsed || 'gemini-3.8-flash');
        setIsLiveApi(res.data.isLiveApi || false);
        setLatencyMs(res.data.executionTimeMs || 110);
        if (!promptText) setScenarioInput('');
      }
    } catch (err) {
      console.error('Failed to ask Gemini Reasoning:', err);
    } finally {
      setAsking(false);
    }
  };

  const handleSimulateAction = (priority: number) => {
    setExecutedActions((prev) => ({
      ...prev,
      [priority]: true,
    }));
  };

  return (
    <>
      <SEO
        title="Gemini Tripartite AI Reasoning — Neuroviax AI"
        description="Autonomous cross-domain AI reasoning connecting MongoDB Inventory, Sales, and Finance powered by Google Gemini (gemini-3.8-flash)."
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
        {/* Top Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>GOOGLE GEMINI TRIPARTITE REASONING</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-slate-400">@google/genai</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
                Cross-Domain AI Reasoning Architecture
              </h1>

              <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                Directly connects live <strong className="text-slate-200">MongoDB</strong> datasets across{' '}
                <span className="text-amber-400 font-medium">Inventory</span>,{' '}
                <span className="text-emerald-400 font-medium">Sales</span>, and{' '}
                <span className="text-cyan-400 font-medium">Finance</span> into{' '}
                <strong className="text-cyan-300">Gemini ({modelUsed})</strong> for causal risk evaluation,
                liquidity runway protection, and prescriptive action plans.
              </p>
            </div>

            {/* Model & Latency Badges */}
            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Engine:</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{modelUsed}</span>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400">Mode:</span>
                <span className={`text-xs font-semibold ${isLiveApi ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {isLiveApi ? 'Live Cloud Inference' : 'Neural Simulation Engine'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {latencyMs}ms
                </span>
              </div>

              <button
                onClick={fetchOverview}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all shadow-md active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Tripartite Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tripartite Overview & Reasoning</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Live Flow Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'simulation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Gemini Scenario Sandbox</span>
          </button>
        </div>

        {/* ARCHITECTURE VIEW */}
        {activeTab === 'architecture' && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 md:p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-cyan-400" />
                  Tripartite Data Pipeline & Cross-Domain Reasoning
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How raw MongoDB documents flow through Gemini (@google/genai) to formulate business directives.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                gemini-3.8-flash
              </span>
            </div>

            {/* Visual Node Diagram */}
            <div className="relative py-8 px-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center">
              {/* TOP NODE: GEMINI */}
              <div className="relative group">
                <div className="w-64 p-4 rounded-xl bg-gradient-to-r from-indigo-900/80 to-cyan-900/80 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-base">
                    <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span>Gemini Core Engine</span>
                  </div>
                  <p className="text-[11px] text-cyan-200/70 font-mono">@google/genai • {modelUsed}</p>
                </div>
              </div>

              {/* STEM DOWN */}
              <div className="w-0.5 h-10 bg-gradient-to-b from-cyan-400 to-indigo-500 my-1 animate-pulse" />

              {/* HORIZONTAL BUS */}
              <div className="relative w-full max-w-2xl h-0.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400" />
              </div>

              {/* THREE DROP DOWN LINES */}
              <div className="w-full max-w-2xl flex justify-between px-12 md:px-20">
                <div className="w-0.5 h-10 bg-amber-500/80" />
                <div className="w-0.5 h-10 bg-emerald-500/80" />
                <div className="w-0.5 h-10 bg-cyan-500/80" />
              </div>

              {/* THREE PILLAR NODES */}
              <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Inventory */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 text-center space-y-2 shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-amber-400 font-bold">
                    <Package className="w-4 h-4" />
                    <span>Inventory</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/50 border border-amber-500/30 text-[11px] font-mono text-amber-300">
                    <Database className="w-3 h-3" />
                    <span>MongoDB (`inventories`)</span>
                  </div>
                  <p className="text-xs text-slate-400">Stock health, low-stock SKUs, supplier lead time</p>
                </div>

                {/* Sales */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-2 shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Sales</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                    <Database className="w-3 h-3" />
                    <span>MongoDB (`orders`)</span>
                  </div>
                  <p className="text-xs text-slate-400">Gross revenue, AOV, order velocity, top sellers</p>
                </div>

                {/* Finance */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center space-y-2 shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>Finance</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                    <Database className="w-3 h-3" />
                    <span>MongoDB (`payments`)</span>
                  </div>
                  <p className="text-xs text-slate-400">Inflows, expenses, liquid capital, cash runway</p>
                </div>
              </div>

              {/* THREE DROP DOWN STEMS */}
              <div className="w-full max-w-2xl flex justify-between px-12 md:px-20 mt-2">
                <div className="w-0.5 h-10 bg-amber-500/80" />
                <div className="w-0.5 h-10 bg-emerald-500/80" />
                <div className="w-0.5 h-10 bg-cyan-500/80" />
              </div>

              {/* HORIZONTAL BUS CONVERGENCE */}
              <div className="relative w-full max-w-2xl h-0.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400" />
              </div>

              {/* FINAL CONVERGENCE STEM */}
              <div className="w-0.5 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 my-1 animate-pulse" />

              {/* BOTTOM NODE: AI REASONING */}
              <div className="w-72 p-4 rounded-xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-2 border-purple-400/50 shadow-xl shadow-purple-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-purple-300 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>AI Reasoning Pipeline</span>
                </div>
                <p className="text-[11px] text-purple-200/80 font-mono">Cross-Domain Prescriptive Directives</p>
              </div>
            </div>

            {/* Configuration Guide */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  Gemini API Configuration Status
                </span>
                <span className="font-mono text-cyan-400">backend/.env</span>
              </div>
              <p>
                Currently configured model: <code className="text-cyan-300 font-mono">GEMINI_MODEL={modelUsed}</code>.
                When <code className="text-cyan-300 font-mono">GEMINI_API_KEY</code> contains your Google AI Studio key,
                Neuroviax dispatches real-time inferences to Google cloud. In offline/demo mode, our neural reasoning
                synthesis engine provides deterministic mathematical correlation.
              </p>
            </div>
          </div>
        )}

        {/* OVERVIEW VIEW */}
        {activeTab === 'overview' && tripartiteData && reasoning && (
          <div className="space-y-8">
            {/* THREE TRIPARTITE DOMAIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. INVENTORY DOMAIN */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-900/80 border border-amber-500/30 p-6 shadow-xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <Package className="w-5 h-5 text-amber-400" />
                    </div>
                    <span>Inventory Pillar</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300">
                    MongoDB
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-black text-white">
                      ${tripartiteData.inventory.totalValuation.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Total Stock Valuation</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div>
                      <div className="text-sm font-bold text-white">{tripartiteData.inventory.totalSKUs}</div>
                      <div className="text-[10px] text-slate-400">SKUs</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-400">
                        {tripartiteData.inventory.statusBreakdown.lowStock}
                      </div>
                      <div className="text-[10px] text-amber-300/80">Low Stock</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-rose-400">
                        {tripartiteData.inventory.statusBreakdown.outOfStock}
                      </div>
                      <div className="text-[10px] text-rose-300/80">Out of Stock</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Avg Supplier Lead Time:</span>
                    <span className="font-semibold text-slate-200">{tripartiteData.inventory.avgLeadTimeDays} Days</span>
                  </div>

                  {tripartiteData.inventory.criticalItems.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-amber-300 block mb-1">
                        Critical Reorder Need:
                      </span>
                      <div className="text-xs text-slate-300 font-mono bg-slate-950/70 p-2 rounded border border-amber-500/20">
                        {tripartiteData.inventory.criticalItems[0].name} ({tripartiteData.inventory.criticalItems[0].quantity} left)
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 2. SALES DOMAIN */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-b from-emerald-950/30 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 p-6 shadow-xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span>Sales Pillar</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                    MongoDB
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-black text-white">
                      ${tripartiteData.sales.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Gross Sales Volume</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div>
                      <div className="text-sm font-bold text-white">{tripartiteData.sales.totalOrders}</div>
                      <div className="text-[10px] text-slate-400">Total Orders</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-400">
                        {tripartiteData.sales.fulfillmentRate}%
                      </div>
                      <div className="text-[10px] text-emerald-300/80">Fulfillment</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-cyan-300">${tripartiteData.sales.aov}</div>
                      <div className="text-[10px] text-cyan-200/80">Avg Order</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Pending Fulfillment:</span>
                    <span className="font-semibold text-slate-200">{tripartiteData.sales.pendingOrders} Orders</span>
                  </div>

                  {tripartiteData.sales.topSellers.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-emerald-300 block mb-1">
                        Top Demand Driver:
                      </span>
                      <div className="text-xs text-slate-300 font-mono bg-slate-950/70 p-2 rounded border border-emerald-500/20">
                        {tripartiteData.sales.topSellers[0].name} ({tripartiteData.sales.topSellers[0].unitsSold} sold)
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 3. FINANCE DOMAIN */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-b from-cyan-950/30 via-slate-900/80 to-slate-900/80 border border-cyan-500/30 p-6 shadow-xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span>Finance Pillar</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                    MongoDB
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-black text-white">
                      ${tripartiteData.finance.liquidWorkingCapital.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Liquid Working Capital</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div>
                      <div className="text-sm font-bold text-cyan-400">
                        {tripartiteData.finance.cashRunwayMonths} mo
                      </div>
                      <div className="text-[10px] text-cyan-300/80">Cash Runway</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-400">
                        {tripartiteData.finance.netMarginPercent}%
                      </div>
                      <div className="text-[10px] text-emerald-300/80">Net Margin</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-300">
                        ${tripartiteData.finance.totalExpenses.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">Expenses</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Pending Receivables:</span>
                    <span className="font-semibold text-slate-200">
                      ${tripartiteData.finance.receivablesPending.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-cyan-300 block mb-1">
                      Financial Resilience:
                    </span>
                    <div className="text-xs text-slate-300 font-mono bg-slate-950/70 p-2 rounded border border-cyan-500/20 flex items-center justify-between">
                      <span>{reasoning.reasoningPillars.financialResilience}</span>
                      <span className="text-emerald-400 text-[10px]">Buffer Secure</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* EXECUTIVE REASONING SYNTHESIS BANNER */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-md">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      <span>Gemini Strategic Executive Synthesis</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Tripartite Core
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Multi-hop reasoning synthesizing Inventory velocity, Sales momentum, and Cash runway.
                    </p>
                  </div>
                </div>

                {/* Tripartite Health Score */}
                <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tripartite Health</div>
                    <div className="text-xs font-semibold text-purple-300">Synchronized</div>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 font-mono">
                    {reasoning.tripartiteHealthScore}/100
                  </div>
                </div>
              </div>

              {/* The Reasoning Text */}
              <div className="p-4 md:p-5 rounded-xl bg-slate-950/90 border border-purple-500/20 text-slate-300 text-sm leading-relaxed">
                {reasoning.executiveSummary}
              </div>
            </div>

            {/* CROSS-DOMAIN INSIGHTS GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Cross-Domain Strategic Correlation Matrix
                </h3>
                <span className="text-xs text-slate-400">
                  Correlating 2+ MongoDB collections concurrently
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reasoning.crossDomainInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {insight.domainIntersection.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              d === 'Inventory'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : d === 'Sales'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {d}
                          </span>
                        ))}
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          insight.severity === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : insight.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {insight.metricHighlight}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-white">{insight.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PRESCRIPTIVE ACTIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Prescriptive Action Directives
                </h3>
                <span className="text-xs text-slate-400">
                  Calculated ROI & Autonomous PO preparation
                </span>
              </div>

              <div className="space-y-3">
                {reasoning.prescriptiveActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Priority #{action.priority}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{action.domainTarget}</span>
                        <span className="text-xs font-semibold text-emerald-400">{action.estimatedROI}</span>
                      </div>
                      <h4 className="text-base font-semibold text-white">{action.title}</h4>
                      <p className="text-xs text-slate-400">{action.impact}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-slate-500">Timeline</div>
                        <div className="text-xs font-mono text-slate-300">{action.timeline}</div>
                      </div>

                      <button
                        onClick={() => handleSimulateAction(action.priority)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md active:scale-95 ${
                          executedActions[action.priority]
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white'
                        }`}
                      >
                        {executedActions[action.priority] ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Executed & Scheduled</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Dispatch Action</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIMULATION & SANDBOX VIEW */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 md:p-8 backdrop-blur-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  Gemini Scenario Sandbox
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pose any business stress-test or hypothetical parameter change. Gemini will cross-analyze the
                  impact on Inventory stockout risk, Sales velocity, and Financial cash runway.
                </p>
              </div>

              {/* Preset Scenario Pills */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Quick Scenario Prompts:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SCENARIOS.map((scenario, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskScenario(scenario)}
                      disabled={asking}
                      className="text-xs text-left px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all"
                    >
                      {scenario}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="relative">
                <textarea
                  value={scenarioInput}
                  onChange={(e) => setScenarioInput(e.target.value)}
                  placeholder="Ask Gemini to reason across Inventory, Sales, and Finance (e.g. 'Can we afford to expand inventory by $15,000 next month without compromising cash runway?')"
                  rows={3}
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all resize-none shadow-inner"
                />

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500 font-mono">
                    Model: {modelUsed} ({isLiveApi ? 'Google Cloud' : 'Neural Engine'})
                  </span>

                  <button
                    onClick={() => handleAskScenario()}
                    disabled={asking || !scenarioInput.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {asking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Reasoning...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Run Tripartite Reasoning</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* REASONING OUTPUT IF AVAILABLE */}
            {reasoning && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Gemini Reasoning Breakdown</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">
                    Health Score: {reasoning.tripartiteHealthScore}/100
                  </span>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950 border border-slate-800">
                  {reasoning.executiveSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Inventory Assessment</div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">
                      {reasoning.reasoningPillars.inventoryHealth}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Sales Assessment</div>
                    <div className="text-xs font-bold text-emerald-300 mt-0.5">
                      {reasoning.reasoningPillars.salesMomentum}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Finance Assessment</div>
                    <div className="text-xs font-bold text-cyan-300 mt-0.5">
                      {reasoning.reasoningPillars.financialResilience}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GeminiReasoningPage;
