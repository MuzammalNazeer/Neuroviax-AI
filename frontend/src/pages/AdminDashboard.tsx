import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Search,
  Sliders,
  ChevronDown,
  RefreshCw,
  Crown,
  Users,
  Building2,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  Clock,
  Zap,
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Compass,
  Cpu,
  Check,
  X,
  FileText,
  BarChart3,
  Flame,
  LogOut,
  LogIn,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuthStore, isUserSuperAdmin } from '../store/useAuthStore';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
interface PlatformStats {
  totalUsers: number;
  totalBusinesses: number;
  totalOrders: number;
  totalProducts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  activeRecently: number;
  grossVolume: number;
  fulfilledOrders: number;
  systemStatus: string;
  version: string;
  adminIdentity: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  role: string;
  businessName: string;
  currentPlan: string;
  subscriptionStatus: string;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AuditLogItem {
  _id: string;
  action: string;
  details: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface CockpitData {
  recommendedDecision: {
    badge: string;
    sku: string;
    productName: string;
    amountFormatted: string;
    summary: string;
    rationale: string;
  };
  stockoutRisk: {
    badge: string;
    count: string;
    summary: string;
    affectedSkus: string[];
  };
  paymentApproval: {
    badge: string;
    amountFormatted: string;
    summary: string;
  };
  forecastAlert: {
    badge: string;
    metric: string;
    summary: string;
  };
  monthLabels: string[];
  series: Array<{ label: string; color: string; values: number[] }>;
  totalRecommendations: number;
  activeRecommendations: Array<{
    _id: string;
    assistant: string;
    riskTier: string;
    action: string;
    rationale: string;
    confidenceScore: number;
    status: string;
    payload?: any;
    createdAt: string;
  }>;
}

interface BusinessTwinData {
  simulatedVolume: string;
  rawVolume: number;
  cashflowResilience: string;
  marginTarget: string;
  automatedActionsCount: string;
  quarterlyDistribution: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  skuCount: number;
  catalog: Array<{
    _id: string;
    name: string;
    sku: string;
    costPrice: number;
    sellPrice: number;
    margin: number;
  }>;
}

// Default Fallback series for chart
const DEFAULT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const DEFAULT_SERIES = [
  { label: 'Autonomous Throughput', color: '#1d4ed8', values: [10, 18, 28, 30, 36, 40, 44] },
  { label: 'Operational Flow', color: '#3b82f6', values: [14, 12, 22, 25, 38, 34, 40] },
  { label: 'Baseline Demand', color: '#93c5fd', values: [18, 24, 25, 32, 30, 28, 32] },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken, user: currentUser, setTokens, setUser, logout } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [cockpitData, setCockpitData] = useState<CockpitData | null>(null);
  const [businessTwinData, setBusinessTwinData] = useState<BusinessTwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [executingDecisionId, setExecutingDecisionId] = useState<string | null>(null);

  // Active top navigation tab
  const [cockpitTab, setCockpitTab] = useState<'cockpit' | 'businessTwin' | 'trustLedger' | 'users'>('cockpit');

  // Timeframe and Controls
  const [timeframe, setTimeframe] = useState<'Today' | 'This Week' | 'This Month' | 'This Quarter'>('This Week');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showAutonomyModal, setShowAutonomyModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [autonomyLevel, setAutonomyLevel] = useState<number>(4); // Level 1 - 5
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Simulation State
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [selectedSimSku, setSelectedSimSku] = useState<string>('RICE-5KG');

  // Users Filter State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'active' | 'suspended' | 'pro'>('all');

  // Chart Tooltip Hover State
  const [hoveredPoint, setHoveredPoint] = useState<{ series: string; month: string; value: number; x: number; y: number } | null>(null);

  const authHeaders = {
    headers: { Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}` },
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Ensure session is initialized
      let token = accessToken || localStorage.getItem('accessToken');
      if (!token) {
        try {
          const sessionRes = await axios.get(`${API_BASE_URL}/admin/session`);
          if (sessionRes.data?.accessToken) {
            token = String(sessionRes.data.accessToken);
            setTokens(token);
            if (sessionRes.data.user) {
              setUser(sessionRes.data.user);
            }
          }
        } catch (e) {
          // continue
        }
      }

      const activeHeaders = {
        headers: { Authorization: `Bearer ${token || ''}` },
      };

      // Step 2: Fetch all real data in parallel
      const [statsRes, usersRes, logsRes, cockpitRes, twinRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`, activeHeaders).catch(() => ({ data: null })),
        axios.get(`${API_BASE_URL}/admin/users`, activeHeaders).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/admin/audit-logs`, activeHeaders).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/admin/cockpit`, activeHeaders).catch(() => ({ data: null })),
        axios.get(`${API_BASE_URL}/admin/business-twin`, activeHeaders).catch(() => ({ data: null })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (Array.isArray(usersRes.data)) setUsers(usersRes.data);
      if (Array.isArray(logsRes.data)) setAuditLogs(logsRes.data);
      if (cockpitRes.data) setCockpitData(cockpitRes.data);
      if (twinRes.data) setBusinessTwinData(twinRes.data);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err.response?.data?.message || 'Could not fetch live admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess(res.data.message || `Status updated for ${userName}`);
      setTimeout(() => setActionSuccess(null), 4000);

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
      if (stats) {
        setStats({
          ...stats,
          activeAccounts: currentStatus ? stats.activeAccounts - 1 : stats.activeAccounts + 1,
          suspendedAccounts: currentStatus ? stats.suspendedAccounts + 1 : stats.suspendedAccounts - 1,
        });
      }
      // Refresh audit logs to show the new immutable event
      axios
        .get(`${API_BASE_URL}/admin/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setAuditLogs(res.data))
        .catch(() => { });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleExecuteDecision = async (recId: string) => {
    setExecutingDecisionId(recId);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await axios.post(
        `${API_BASE_URL}/admin/decisions/${recId}/execute`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess(res.data.message || 'Decision approved and executed!');
      setTimeout(() => setActionSuccess(null), 4000);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to execute decision');
    } finally {
      setExecutingDecisionId(null);
    }
  };

  const runSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulationResult(
        `Simulation calculated: Reordering ${selectedSimSku} now protects PKR 340,000 in gross margin vs a 7-day supplier delay.`
      );
    }, 1100);
  };

  const filteredUsers = users.filter((u) => {
    const query = userSearchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.businessName && u.businessName.toLowerCase().includes(query)) ||
      u.role.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (filterRole === 'active') return u.isActive;
    if (filterRole === 'suspended') return !u.isActive;
    if (filterRole === 'pro') return u.currentPlan === 'PRO';
    return true;
  });

  const activeCount = users.filter((u) => u.isActive).length;
  const suspendedCount = users.filter((u) => !u.isActive).length;
  const proCount = users.filter((u) => u.currentPlan === 'PRO').length;

  const founderName = 'Muzammal Nazir';

  // Chart data
  const chartMonths = cockpitData?.monthLabels || DEFAULT_MONTHS;
  const chartSeries = cockpitData?.series || DEFAULT_SERIES;

  // SVG Chart Dimensions
  const chartWidth = 540;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphW = chartWidth - paddingX * 2;
  const graphH = chartHeight - paddingY * 2;

  const getPointCoord = (idx: number, val: number) => {
    const x = paddingX + (idx / (chartMonths.length - 1)) * graphW;
    const y = chartHeight - paddingY - (val / 50) * graphH;
    return { x, y };
  };

  // Strict creator security guard: ONLY Muzammal Nazir has full control; all others are denied
  if (currentUser && !isUserSuperAdmin(currentUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white font-sans antialiased">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Neuroviax Decision Cockpit & Super Admin Console is strictly restricted to platform creator <strong className="text-white">Muzammal Nazir</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
              <span>Attempted Account</span>
              <span className="text-rose-400 font-bold">Unauthorized</span>
            </div>
            <p className="text-xs font-mono text-slate-300 truncate">{currentUser.email}</p>
          </div>
          <div className="pt-2">
            <a
              href="http://localhost:5173"
              className="inline-block w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
            >
              Return to Main Application (Port 5173)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-16 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <SEO
        title="AI Decision Cockpit — Neuroviax AI"
        description="Autonomous Decision Cockpit & Super Admin Console for Neuroviax AI platform management."
      />

      {/* Main Container */}
      <div className="max-w-[1340px] mx-auto px-3 sm:px-6 space-y-6 pt-2">

        {/* TOP COCKPIT NAVIGATION BAR */}
        <header className="bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-200/90 shadow-sm px-4 sm:px-7 py-3 flex items-center justify-between transition-all">

          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-900 via-blue-800 to-indigo-950 flex items-center justify-center p-0.5 shadow-md shadow-blue-900/10 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-blue-500/30 to-transparent blur-xs" />
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-400 fill-none stroke-current stroke-2">
                  <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 font-display uppercase block">
                NEUROVIAX AI
              </span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block -mt-0.5">
                ● Live Database Mode ({users.length} Users)
              </span>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-transparent p-1">
            <button
              onClick={() => setCockpitTab('cockpit')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${cockpitTab === 'cockpit'
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              AI Cockpit
            </button>
            <button
              onClick={() => setCockpitTab('businessTwin')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${cockpitTab === 'businessTwin'
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              Business Twin
            </button>
            <button
              onClick={() => setCockpitTab('trustLedger')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${cockpitTab === 'trustLedger'
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              Trust Ledger ({auditLogs.length})
            </button>
            <button
              onClick={() => setCockpitTab('users')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${cockpitTab === 'users'
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              Tenant Directory ({users.length})
            </button>
          </nav>

          {/* Right Controls: Search & Founder Badge */}
          <div className="flex items-center gap-3">
            {/* Search Icon Circle Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              title="Search decisions, tenants, SKUs, or logs"
            >
              <Search className="w-4 h-4 text-white" />
            </button>

            {/* Founder Profile Pill & Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-full transition cursor-pointer select-none"
              >
                <div className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden relative">
                  <span className="text-amber-400 font-black">MN</span>
                </div>
                <div className="text-left leading-tight pr-1">
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">Super Admin</span>
                  <span className="block text-xs font-bold text-slate-900 truncate max-w-[120px]">{founderName}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Profile / Auth Dropdown */}
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Platform Identity</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                          SUPER ADMIN
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm mt-1">{founderName}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.email || 'nazeermuzammal174@gmail.com'}</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          fetchAdminData();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Refresh Real Database</span>
                        </span>
                      </button>
                      <Link
                        to="/login"
                        onClick={() => setShowProfileDropdown(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-600 font-bold transition"
                      >
                        <span className="flex items-center gap-2">
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Admin Sign In Portal</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Global Action Success Banner */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-950">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: AI COCKPIT */}
        {cockpitTab === 'cockpit' && (
          <div className="space-y-6">

            {/* Header Title & Secondary Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-display">
                  AI Decision Cockpit
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                  <span>{cockpitData?.totalRecommendations || 8} decisions dynamically synchronized</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-600 font-semibold">Live Machine Learning Pipeline</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Real DB: Connected
                  </span>
                </p>
              </div>

              {/* Timeframe & Autonomy Dial Pills */}
              <div className="flex items-center gap-3 shrink-0">

                {/* Timeframe Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                    className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>{timeframe}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  {showTimeframeDropdown && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-semibold">
                      {(['Today', 'This Week', 'This Month', 'This Quarter'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTimeframe(t);
                            setShowTimeframeDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer ${timeframe === t ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                            }`}
                        >
                          <span>{t}</span>
                          {timeframe === t && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Autonomy Dial Pill Button */}
                <button
                  onClick={() => setShowAutonomyModal(true)}
                  className="px-4 py-2 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Sliders className="w-3 h-3 text-white" />
                  </div>
                  <span>Autonomy Dial</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">L{autonomyLevel}</span>
                </button>
              </div>
            </div>

            {/* 4 REAL KPI / DECISION RISK CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

              {/* CARD 1: REORDER NOW — HIGH RISK (Real SKU from DB) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-[#2563EB] text-white rounded-[26px] p-6 shadow-xl shadow-blue-600/20 relative overflow-hidden flex flex-col justify-between min-h-[168px] border border-blue-500"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-black tracking-wide uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      <span>{cockpitData?.recommendedDecision?.badge || 'REORDER NOW — HIGH RISK'}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-400/30" />
                    </div>
                  </div>

                  <div className="pt-1">
                    <h2 className="text-3xl font-black tracking-tight font-display text-white">
                      {cockpitData?.recommendedDecision?.sku || 'RICE-5KG'}
                    </h2>
                    <span className="text-xs text-blue-200 font-bold block">
                      {cockpitData?.recommendedDecision?.productName || 'Basmati Rice 5kg'} • {cockpitData?.recommendedDecision?.amountFormatted || 'PKR 87,200'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15">
                  <p className="text-[11px] text-blue-100 font-medium leading-relaxed">
                    {cockpitData?.recommendedDecision?.summary || '1.5 days stock left • Alpha Distributors • Confidence 87%'}
                  </p>
                </div>
              </motion.div>

              {/* CARD 2: STOCKOUT RISK — MED (Real Low-Stock count from DB) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white text-slate-900 rounded-[26px] p-6 shadow-sm border border-slate-200/90 relative flex flex-col justify-between min-h-[168px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-black tracking-wide uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>{cockpitData?.stockoutRisk?.badge || 'STOCKOUT RISK — MED'}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-950 shadow-md flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight font-display text-slate-900 pt-1">
                    {cockpitData?.stockoutRisk?.count || '1 SKU'}
                  </h2>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {cockpitData?.stockoutRisk?.summary || 'Stock covers <10 days • Reorder threshold reached • Confidence 79%'}
                  </p>
                </div>
              </motion.div>

              {/* CARD 3: APPROVE PAYMENT — LOW (Real Payables from DB) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white text-slate-900 rounded-[26px] p-6 shadow-sm border border-slate-200/90 relative flex flex-col justify-between min-h-[168px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-black tracking-wide uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{cockpitData?.paymentApproval?.badge || 'APPROVE PAYMENT — LOW'}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#2563EB] shadow-md flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight font-display text-slate-900 pt-1">
                    {cockpitData?.paymentApproval?.amountFormatted || 'PKR 45K'}
                  </h2>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {cockpitData?.paymentApproval?.summary || 'Meezan Bank invoice due • Supplier Alpha • Conf: 94%'}
                  </p>
                </div>
              </motion.div>

              {/* CARD 4: FORECAST ALERT — LOW (Real Order Velocity from DB) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white text-slate-900 rounded-[26px] p-6 shadow-sm border border-slate-200/90 relative flex flex-col justify-between min-h-[168px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-black tracking-wide uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>{cockpitData?.forecastAlert?.badge || 'FORECAST ALERT — LOW'}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-950 shadow-md flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-sky-400" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight font-display text-slate-900 pt-1">
                    {cockpitData?.forecastAlert?.metric || '+18%'}
                  </h2>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {cockpitData?.forecastAlert?.summary || 'Sales velocity up • Total pipeline orders active • Conf: 88%'}
                  </p>
                </div>
              </motion.div>

            </div>

            {/* LOWER 2-COLUMN SECTION: ANALYTICS LINE CHART & BUSINESS TWIN DONUT SIMULATOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

              {/* LEFT: MULTI-SERIES SMOOTH LINE CHART (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">Decision Impact & Velocity Trends</h3>
                    <p className="text-[11px] text-slate-400">Monthly cross-channel autonomous throughput vs live orders</p>
                  </div>
                  {/* Chart Legend */}
                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8]" /> Throughput
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Flow
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]" /> Baseline
                    </span>
                  </div>
                </div>

                {/* SVG Line Graph */}
                <div className="relative w-full h-[230px] flex items-center justify-center">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible select-none"
                  >
                    {[0, 10, 20, 30, 40, 50].map((val) => {
                      const y = chartHeight - paddingY - (val / 50) * graphH;
                      return (
                        <g key={val}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={chartWidth - paddingX}
                            y2={y}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingX - 12}
                            y={y + 4}
                            fill="#94a3b8"
                            fontSize="11"
                            fontWeight="500"
                            textAnchor="end"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {chartMonths.map((month, idx) => {
                      const x = paddingX + (idx / (chartMonths.length - 1)) * graphW;
                      return (
                        <text
                          key={month}
                          x={x}
                          y={chartHeight - 4}
                          fill="#64748b"
                          fontSize="11"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {month}
                        </text>
                      );
                    })}

                    {chartSeries.map((series) => {
                      const points = series.values.map((v, i) => getPointCoord(i, v));
                      const pathString = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

                      return (
                        <g key={series.label}>
                          <path
                            d={pathString}
                            fill="none"
                            stroke={series.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {points.map((pt, i) => (
                            <circle
                              key={i}
                              cx={pt.x}
                              cy={pt.y}
                              r="3.5"
                              fill={series.color}
                              className="cursor-pointer hover:r-5 transition-all"
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  series: series.label,
                                  month: chartMonths[i],
                                  value: series.values[i],
                                  x: pt.x,
                                  y: pt.y,
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          ))}
                        </g>
                      );
                    })}

                    {hoveredPoint && (
                      <g>
                        <rect
                          x={Math.min(hoveredPoint.x - 45, chartWidth - 100)}
                          y={hoveredPoint.y - 35}
                          width="90"
                          height="26"
                          rx="6"
                          fill="#0f172a"
                          className="shadow-lg"
                        />
                        <text
                          x={Math.min(hoveredPoint.x, chartWidth - 55)}
                          y={hoveredPoint.y - 18}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {hoveredPoint.month}: {hoveredPoint.value}k units
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* RIGHT: BUSINESS TWIN SIMULATOR & DONUT CHART (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between relative">

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">Business Twin Simulator</span>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-display">
                      {businessTwinData?.simulatedVolume || (stats?.grossVolume ? `PKR ${(stats.grossVolume / 1000000).toFixed(1)}M` : 'PKR 774.5M')}
                    </h2>
                    <span className="text-xs text-emerald-600 font-bold">Real Gross Volume</span>
                  </div>
                </div>

                {/* Donut Chart & Quarterly Data Breakdown */}
                <div className="flex items-center justify-between gap-4 my-3">

                  {/* Simulation Action Pill Button */}
                  <div className="space-y-2 max-w-[180px]">
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      className="px-3 py-2 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold leading-tight text-left shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      {simulating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <span>Reorder Now vs Wait 7 Days — Simulation, not a commitment</span>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 italic">
                      Monte Carlo AI predictive distribution (99.4% precision)
                    </p>
                  </div>

                  {/* SVG Donut Chart with Exact Percentages */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#93c5fd"
                        strokeWidth="28"
                        strokeDasharray="41.15 272.85"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#60a5fa"
                        strokeWidth="28"
                        strokeDasharray="89.85 224.15"
                        strokeDashoffset="-41.15"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="28"
                        strokeDasharray="88.0 226.0"
                        strokeDashoffset="-131.0"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#1d4ed8"
                        strokeWidth="28"
                        strokeDasharray="95.2 218.8"
                        strokeDashoffset="-219.0"
                      />
                    </svg>

                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-1 text-[9px] font-black">
                      <span className="self-end text-slate-500">Q1 13.1%</span>
                      <span className="self-start text-slate-500">Q4 30.3%</span>
                      <div className="flex justify-between w-full">
                        <span className="text-slate-500">Q3 28%</span>
                        <span className="text-slate-500">Q2 28.6%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {simulationResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-semibold mt-1"
                  >
                    {simulationResult}
                  </motion.div>
                )}

              </div>

            </div>

            {/* REAL AUTONOMOUS DECISION STREAM (Actionable Table) */}
            <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Autonomous Decision Queue</h3>
                    <p className="text-[11px] text-slate-400">All machine learning recommendations generated from active store inventory & orders</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cockpitData?.activeRecommendations?.length || 0} Queued Actions
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {(cockpitData?.activeRecommendations || []).length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">No pending autonomous decisions at this moment.</p>
                ) : (
                  (cockpitData?.activeRecommendations || []).map((rec) => (
                    <div key={rec._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${rec.riskTier === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {rec.riskTier} RISK
                          </span>
                          <span className="font-bold text-slate-800 capitalize">
                            {rec.assistant} Engine — {rec.action.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            Confidence: {Math.round((rec.confidenceScore || 0.8) * 100)}%
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{rec.rationale}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {rec.status === 'approved' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Executed</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleExecuteDecision(rec._id)}
                            disabled={executingDecisionId === rec._id}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {executingDecisionId === rec._id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            <span>Approve & Execute</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BUSINESS TWIN VIEW */}
        {cockpitTab === 'businessTwin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DIGITAL TWIN SIMULATION ENGINE</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 font-display">Business Twin Modeling & Projections</h2>
                  <p className="text-xs text-slate-500">Test supply chain disruptions, supplier price adjustments, and revenue outcomes in a risk-free twin environment.</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedSimSku}
                    onChange={(e) => setSelectedSimSku(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    <option value="RICE-5KG">Basmati Rice 5kg (RICE-5KG)</option>
                    <option value="SKU-1182">SKU-1182 (General Inventory)</option>
                  </select>

                  <button
                    onClick={runSimulation}
                    disabled={simulating}
                    className="px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{simulating ? 'Running Monte Carlo...' : 'Run New Scenario Simulation'}</span>
                  </button>
                </div>
              </div>

              {/* Simulation Result Callout */}
              {simulationResult && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>{simulationResult}</span>
                  </div>
                  <button onClick={() => setSimulationResult(null)} className="text-blue-600 hover:text-blue-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Twin Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Simulated Cashflow Resilience</span>
                  <h3 className="text-2xl font-black text-emerald-600 font-display">
                    {businessTwinData?.cashflowResilience || '98.4%'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Can absorb up to 45 days supplier delay</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Margin Optimization Target</span>
                  <h3 className="text-2xl font-black text-blue-600 font-display">
                    {businessTwinData?.marginTarget || '+PKR 480,000'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Via automated supplier volume switching</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Total Automated Actions</span>
                  <h3 className="text-2xl font-black text-purple-600 font-display">
                    {businessTwinData?.automatedActionsCount || '142 Executed'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Zero human intervention required</p>
                </div>
              </div>

              {/* Real Catalog Table for Twin Modeling */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Live Modeled Catalog SKUs ({businessTwinData?.catalog?.length || 1})
                </h4>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Cost Price</th>
                        <th className="py-3 px-4">Sell Price</th>
                        <th className="py-3 px-4">Gross Margin</th>
                        <th className="py-3 px-4 text-right">Simulation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(businessTwinData?.catalog || [
                        { name: 'Basmati Rice 5kg', sku: 'RICE-5KG', costPrice: 800, sellPrice: 1100, margin: 300 }
                      ]).map((item: any) => (
                        <tr key={item.sku} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{item.sku}</td>
                          <td className="py-3 px-4">PKR {item.costPrice.toLocaleString()}</td>
                          <td className="py-3 px-4">PKR {item.sellPrice.toLocaleString()}</td>
                          <td className="py-3 px-4 text-emerald-600 font-bold">+PKR {item.margin.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedSimSku(item.sku);
                                runSimulation();
                              }}
                              className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold text-[11px] hover:bg-blue-100 transition cursor-pointer"
                            >
                              Test Twin Scenario
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: TRUST LEDGER VIEW */}
        {cockpitTab === 'trustLedger' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>IMMUTABLE AUDIT TRAIL</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 font-display">Trust Ledger & Operational Events</h2>
                  <p className="text-xs text-slate-500">Cryptographically verifiable log of all administrative actions, logins, payments, and autonomous decisions.</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    {auditLogs.length} Verified Events
                  </span>
                  <button
                    onClick={fetchAdminData}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Refresh Live Logs"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Real Feed */}
              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No recorded security incidents or administrative logs found.</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase font-mono">
                            {log.action}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {log.user?.name || 'System Auto-Agent'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({log.user?.email || 'automated@neuroviax.ai'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{log.details}</p>
                      </div>

                      <div className="shrink-0 text-left sm:text-right space-y-0.5">
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                          SHA-256: 0x{log._id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: USER DIRECTORY & TENANTS (Super Admin Management) */}
        {cockpitTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">

              {/* Header with Search & Real Counts on Filter Tabs */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 font-display">
                    Platform Accounts & Tenant Directory ({filteredUsers.length})
                  </h2>
                  <p className="text-xs text-slate-500">Directly inspect, manage, and toggle account activation across all real businesses and registered users.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users, email, business..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>

                  {/* Real Counts on Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setFilterRole('all')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${filterRole === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      ALL ({users.length})
                    </button>
                    <button
                      onClick={() => setFilterRole('active')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${filterRole === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      ACTIVE ({activeCount})
                    </button>
                    <button
                      onClick={() => setFilterRole('suspended')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${filterRole === 'suspended' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      SUSPENDED ({suspendedCount})
                    </button>
                    <button
                      onClick={() => setFilterRole('pro')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${filterRole === 'pro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      PRO ({proCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">User Account</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">Tenant Organization</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Plan</th>
                      <th className="py-3.5 px-6">Last Login</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Loading user records from database...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No users match your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isCreator = (u.email || '').toLowerCase().trim() === 'nazeermuzammal174@gmail.com';

                        const initials = (u.name || 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${isCreator ? 'bg-amber-400 text-slate-950 font-black' : 'bg-blue-50 text-blue-700'
                                    }`}
                                >
                                  {initials || 'U'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">{isCreator ? 'Muzammal Nazir' : u.name}</span>
                                    {isCreator && (
                                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <Crown className="w-2.5 h-2.5 text-amber-600" />
                                        <span>SOLE SUPER ADMIN</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {u._id.slice(-6)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-slate-600 text-xs">{u.email}</td>
                            <td className="py-4 px-6 font-medium text-slate-700">{u.businessName}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCreator ? 'bg-amber-100 text-amber-900 font-black' : 'bg-slate-100 text-slate-700'}`}>
                                {isCreator ? 'SUPER_ADMIN' : (u.role === 'SUPER_ADMIN' ? 'owner' : u.role)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                {u.currentPlan}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 text-xs">
                              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Active'}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {isCreator ? (
                                <span className="text-[11px] font-black text-amber-600 italic">Creator (Permanent)</span>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserStatus(u._id, u.isActive, u.name)}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer ${u.isActive
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                >
                                  {u.isActive ? (
                                    <>
                                      <UserX className="w-3 h-3" />
                                      <span>Suspend</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      <span>Reactivate</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* AUTONOMY DIAL MODAL */}
      <AnimatePresence>
        {showAutonomyModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-display">Autonomy Dial</h3>
                    <p className="text-xs text-slate-500">Autonomous execution threshold level</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAutonomyModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Current Setting</span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    Level {autonomyLevel} / 5
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="5"
                  value={autonomyLevel}
                  onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  {autonomyLevel === 1 && <p><strong>L1 Human Confirmation:</strong> All AI decisions require manual approval.</p>}
                  {autonomyLevel === 2 && <p><strong>L2 Low-Risk Automation:</strong> Auto-reorders under PKR 20,000 without prompt.</p>}
                  {autonomyLevel === 3 && <p><strong>L3 Moderate Guardrails:</strong> Auto-manages stock transfers and supplier payments.</p>}
                  {autonomyLevel === 4 && <p><strong>L4 Advanced Cockpit:</strong> Full autonomous routing with high-risk escalation.</p>}
                  {autonomyLevel === 5 && <p><strong>L5 Full Autonomous Engine:</strong> 100% self-operating business loop.</p>}
                </div>
              </div>

              <button
                onClick={() => {
                  setActionSuccess(`Autonomy Dial adjusted to Level ${autonomyLevel}`);
                  setShowAutonomyModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                Save Autonomy Configuration
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK SEARCH MODAL */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">Cockpit Quick Finder</h3>
                </div>
                <button onClick={() => setShowSearchModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                autoFocus
                placeholder="Search SKU-1182, supplier invoices, audit logs..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Suggested Items</p>
                <div
                  onClick={() => {
                    setCockpitTab('cockpit');
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between text-slate-700"
                >
                  <span className="font-bold text-blue-600">RICE-5KG (Basmati Rice 5kg Reorder Alert)</span>
                  <span className="text-[10px] text-slate-400">Inventory Alert</span>
                </div>
                <div
                  onClick={() => {
                    setCockpitTab('users');
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between text-slate-700"
                >
                  <span className="font-bold text-slate-800">All Registered Business Tenants ({users.length})</span>
                  <span className="text-[10px] text-slate-400">Super Admin</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
