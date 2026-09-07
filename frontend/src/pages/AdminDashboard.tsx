import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  ShieldCheck,
  Crown,
  Users,
  Building2,
  DollarSign,
  ShoppingCart,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
  Eye,
  Activity,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Filter,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuthStore } from '../store/useAuthStore';

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

const AdminDashboard: React.FC = () => {
  const { accessToken, user: currentUser } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'active' | 'suspended' | 'pro'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  const authHeaders = {
    headers: { Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken')}` },
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`, authHeaders),
        axios.get(`${API_BASE_URL}/admin/users`, authHeaders),
        axios.get(`${API_BASE_URL}/admin/audit-logs`, authHeaders),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAuditLogs(logsRes.data || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err.response?.data?.message || 'Could not fetch Super Admin analytics. Ensure token is valid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {}, authHeaders);
      setActionSuccess(res.data.message || `Status updated for ${userName}`);
      setTimeout(() => setActionSuccess(null), 4000);

      // Update local state smoothly
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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRole === 'active') return u.isActive;
    if (filterRole === 'suspended') return !u.isActive;
    if (filterRole === 'pro') return u.currentPlan === 'PRO';
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      <SEO
        title="Platform Super Admin Console — Muzammal Nazeer Exclusive"
        description="Exclusive administrative console for platform owner Muzammal Nazeer to oversee all registered users, signups, logins, and tenant activity."
      />

      {/* Super Admin Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl text-white"
      >
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>PLATFORM OWNER CONSOLE • RESTRICTED ACCESS</span>
            </div>
            <h1 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-3">
              <span>Super Admin Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Authorized strictly for <strong className="text-emerald-300 font-semibold">Muzammal Nazeer</strong>.
              Oversee all platform signups, user logins, organizational tenants, and real-time operational events.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                MN
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Muzammal Nazeer</p>
                <p className="text-[10px] text-emerald-400 font-mono">nazeermuzammal174@gmail.com</p>
              </div>
            </div>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Users</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 font-display">
              {loading ? '...' : stats?.totalUsers || users.length}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{stats?.activeAccounts ?? users.filter(u => u.isActive).length} active</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-500">{stats?.suspendedAccounts ?? users.filter(u => !u.isActive).length} suspended</span>
            </p>
          </div>
        </motion.div>

        {/* Total Businesses / Tenants */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Tenants</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 font-display">
              {loading ? '...' : stats?.totalBusinesses || 1}
            </h3>
            <p className="text-xs text-emerald-600 font-medium">Multi-branch enterprise active</p>
          </div>
        </motion.div>

        {/* Platform Gross Volume */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Platform Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 font-display">
              {loading ? '...' : `$${(stats?.grossVolume || 150).toLocaleString()}`}
            </h3>
            <p className="text-xs text-slate-500">Across verified invoices & purchases</p>
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transactions</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 font-display">
              {loading ? '...' : stats?.totalOrders || 1}
            </h3>
            <p className="text-xs text-purple-600 font-medium">AI reorders & customer sales</p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Card: Tab View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs & Search Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Registered Users ({filteredUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Security & Audit Feed</span>
            </button>
          </div>

          {/* Search and Filters (Visible on Users tab) */}
          {activeTab === 'users' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'active', 'suspended', 'pro'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterRole(filter)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                      filterRole === filter
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: All Registered Users Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User / Account</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Organization</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Plan Tier</th>
                  <th className="py-3.5 px-6">Last Login</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                        <span>Loading user accounts securely...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No user accounts match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isMuzammal = u.email.toLowerCase() === 'nazeermuzammal174@gmail.com' || u.isSuperAdmin;
                    const initials = u.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isMuzammal
                                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {initials || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">{u.name}</span>
                                {isMuzammal && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5 text-amber-600" />
                                    <span>OWNER</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {u._id.slice(-6)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 font-mono text-slate-600 text-xs">
                          {u.email}
                        </td>

                        {/* Organization */}
                        <td className="py-4 px-6 font-medium text-slate-700">
                          {u.businessName}
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isMuzammal
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : u.role === 'owner'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.currentPlan === 'PRO'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : u.currentPlan === 'BASIC'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.currentPlan}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {u.lastLoginAt ? (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(u.lastLoginAt).toLocaleDateString()}</span>
                              <span className="text-slate-400">{new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Never logged in</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          {isMuzammal ? (
                            <span className="text-[11px] font-medium text-slate-400 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.isActive, u.name)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ml-auto ${
                                u.isActive
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
        )}

        {/* Tab 2: Live Security & Audit Feed */}
        {activeTab === 'activity' && (
          <div className="p-6">
            <div className="space-y-3 max-w-4xl">
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>No recent administrative audit events recorded.</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase font-mono">
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {log.user?.name || 'System / Anonymous'} ({log.user?.email || 'System'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
