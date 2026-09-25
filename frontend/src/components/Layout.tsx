import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Receipt,
  CreditCard,
  Users,
  Truck,
  Sparkles,
  LogOut,
  Building2,
  Bot,
  Zap,
  ShieldCheck,
  ChevronRight,
  UserCog,
  Crown,
  Shield,
  UserCheck,
  ClipboardList,
  Bell,
  BarChart3,
  Plug,
  DollarSign,
  MessageCircle,
  Check,
  CheckCheck,
  Home,
  Info,
  Mail,
  Globe,
  Menu,
  X,
  ExternalLink,
  TrendingUp,
  LineChart,
  ShieldAlert,
} from 'lucide-react';
import api from '../api/axios';

const ALL_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'core', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'] },
  { to: '/products', label: 'Products', icon: Package, group: 'core', roles: ['owner', 'admin', 'manager', 'staff'] },
  { to: '/inventory', label: 'Inventory', icon: Warehouse, group: 'core', roles: ['owner', 'admin', 'manager', 'staff'] },
  { to: '/orders', label: 'Orders', icon: Receipt, group: 'core', roles: ['owner', 'admin', 'manager', 'staff'] },
  { to: '/payments', label: 'Payments', icon: CreditCard, group: 'core', roles: ['owner', 'admin', 'manager', 'accountant'] },
  { to: '/expenses', label: 'Expenses', icon: DollarSign, group: 'core', roles: ['owner', 'admin', 'manager', 'accountant'] },
  { to: '/customers', label: 'Customers', icon: Users, group: 'core', roles: ['owner', 'admin', 'manager', 'staff'] },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, group: 'core', roles: ['owner', 'admin', 'manager'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, group: 'admin', roles: ['owner', 'admin', 'manager', 'accountant'], badge: 'BI' },
  { to: '/integrations', label: 'Integrations', icon: Plug, group: 'admin', roles: ['owner', 'admin'], badge: 'API' },
  { to: '/subscription', label: 'Subscription', icon: Crown, group: 'admin', roles: ['owner', 'admin', 'manager', 'accountant', 'staff'] },
  { to: '/team', label: 'Team & Admin', icon: UserCog, group: 'admin', roles: ['owner', 'admin', 'manager'], badge: 'ADMIN' },
  { to: '/demand-forecasting', label: 'Demand Forecasting', icon: TrendingUp, group: 'ai', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'], badge: 'ML' },
  { to: '/cash-flow-prediction', label: 'Cash-Flow AI', icon: LineChart, group: 'ai', roles: ['owner', 'admin', 'manager', 'accountant'], badge: 'XGB' },
  { to: '/anomaly-detection', label: 'Anomaly Shield', icon: ShieldAlert, group: 'ai', roles: ['owner', 'admin', 'manager', 'accountant', 'staff'], badge: 'iForest' },
  { to: '/customer-segmentation', label: 'Customer Segments', icon: Users, group: 'ai', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'], badge: 'K-Means' },
  { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles, group: 'ai', roles: ['owner', 'admin', 'manager', 'accountant'], badge: 'AI' },
  { to: '/ai-assistants', label: 'AI Assistants', icon: Bot, group: 'ai', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'], badge: 'NEW' },
  { to: '/chatboard', label: 'AI Chatboard', icon: Zap, group: 'ai', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'], badge: 'COPILOT' },
];

const ROLE_STYLES: Record<string, { label: string; badge: string; icon: React.ComponentType<any>; iconColor: string }> = {
  owner: { label: 'Owner', badge: 'bg-amber-400/20 text-amber-300 border border-amber-500/40', icon: Crown, iconColor: 'text-amber-300' },
  admin: { label: 'Admin', badge: 'bg-violet-400/20 text-violet-300 border border-violet-500/40', icon: Shield, iconColor: 'text-violet-300' },
  manager: { label: 'Manager', badge: 'bg-blue-400/20 text-blue-300 border border-blue-500/40', icon: ClipboardList, iconColor: 'text-blue-300' },
  staff: { label: 'Staff', badge: 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40', icon: UserCheck, iconColor: 'text-emerald-300' },
  accountant: { label: 'Accountant', badge: 'bg-teal-400/20 text-teal-300 border border-teal-500/40', icon: CreditCard, iconColor: 'text-teal-300' },
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Silently catch in layout
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifs]);

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleMarkSingleRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'read' } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getNotificationRoute = (n: any): string => {
    if (n.metadata?.route) return n.metadata.route;
    if (n.metadata?.link) return n.metadata.link;
    const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    if (
      text.includes('iforest') ||
      text.includes('anomaly') ||
      text.includes('shrinkage') ||
      text.includes('off-hours') ||
      text.includes('flagged') ||
      text.includes('mismatch')
    ) {
      return '/anomaly-detection';
    }
    if (
      text.includes('campaign') ||
      text.includes('segment') ||
      text.includes('dormant') ||
      text.includes('customer segment')
    ) {
      return '/customer-segmentation';
    }
    if (text.includes('payment') || text.includes('invoice') || text.includes('payout')) {
      return '/payments';
    }
    if (text.includes('inventory') || text.includes('stock') || text.includes('reorder')) {
      return '/inventory';
    }
    if (text.includes('order')) {
      return '/orders';
    }
    if (text.includes('cash flow') || text.includes('cash-flow')) {
      return '/cash-flow-prediction';
    }
    if (text.includes('demand') || text.includes('forecast')) {
      return '/demand-forecasting';
    }
    if (text.includes('recommendation') || text.includes('advisory')) {
      return '/recommendations';
    }
    if (text.includes('expense')) {
      return '/expenses';
    }
    return '/dashboard';
  };

  const handleNotificationClick = async (n: any) => {
    if (n.status === 'unread') {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, status: 'read' } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotifs(false);
    const targetRoute = getNotificationRoute(n);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  const activeMembership = user?.memberships?.[0];
  const currentRole = activeMembership?.role || 'staff';
  const roleStyle = ROLE_STYLES[currentRole] || ROLE_STYLES.staff;
  const RoleIcon = roleStyle.icon;

  const businessName = activeMembership?.business?.name || 'Primary Business';
  const pageLabel = location.pathname === '/' || location.pathname === '/dashboard' ? 'Dashboard' : location.pathname.slice(1).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const navItems = ALL_NAV_ITEMS.filter((n) => n.roles.includes(currentRole));
  const coreNav = navItems.filter((n) => n.group === 'core');
  const adminNav = navItems.filter((n) => n.group === 'admin');
  const aiNav = navItems.filter((n) => n.group === 'ai');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <SEO noIndex={true} />
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-[#052e16] via-[#064e3b] to-[#065f46] text-white flex flex-col shadow-2xl relative z-20 shrink-0">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-32 h-32 bg-teal-400/6 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-900/60 relative">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-emerald-950/30 shrink-0 p-0.5 border border-emerald-400/30"
            >
              <img src="/logo.png" alt="Neuroviax AI Logo" className="w-full h-full object-contain rounded-lg" />
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-black font-display tracking-tight text-white">Neuroviax AI</h1>
              </div>
              <p className="text-[10px] text-emerald-300/70 mt-0.5 leading-tight">AI-First Autonomous Business Operating Platform</p>
            </div>
          </div>

          {/* Business + Phase pill */}
          <div className="mt-3.5 space-y-1.5">
            <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-100 truncate">{businessName}</span>
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="flex items-center gap-1 text-[10px] text-emerald-400/80 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Phase 1 — Foundation Active
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3.5 space-y-0.5 overflow-y-auto">

          {/* Core Operations */}
          <p className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest px-3 pt-1 pb-1.5">Core Operations</p>
          {coreNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className="relative block">
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white/12 backdrop-blur-md rounded-xl border border-white/15 shadow-inner"
                  />
                )}
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive ? 'text-white font-semibold' : 'text-emerald-100/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-300/60'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-emerald-400/60" />}
                </motion.div>
              </NavLink>
            );
          })}

          {/* Admin / Team (role-gated) */}
          {adminNav.length > 0 && (
            <>
              <p className="text-[9px] font-black text-violet-400/60 uppercase tracking-widest px-3 pt-3 pb-1.5">Administration</p>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <NavLink key={item.to} to={item.to} className="relative block">
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-violet-400/15 rounded-xl border border-violet-400/25 shadow-inner"
                      />
                    )}
                    <motion.div
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive ? 'text-violet-200 font-semibold' : 'text-emerald-100/70 hover:text-white hover:bg-white/8'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-300' : 'text-violet-300/60'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-violet-400/20 text-violet-200 border border-violet-400/30">
                          {item.badge}
                        </span>
                      )}
                      {!item.badge && isActive && <ChevronRight className="w-3 h-3 text-violet-400/60" />}
                    </motion.div>
                  </NavLink>
                );
              })}

            </>
          )}

          {/* AI Layer */}
          <p className="text-[9px] font-black text-purple-400/60 uppercase tracking-widest px-3 pt-3 pb-1.5">AI Intelligence Layer</p>
          {aiNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} className="relative block">
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-purple-400/10 rounded-xl border border-purple-400/20 shadow-inner"
                  />
                )}
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive ? 'text-purple-200 font-semibold' : 'text-emerald-100/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-purple-300/60'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      item.badge === 'NEW'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-purple-400/20 text-purple-200 border border-purple-400/30 animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </NavLink>
            );
          })}

        </nav>

        {/* User Card */}
        <div className="p-3.5 border-t border-emerald-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/40 to-teal-500/30 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-black text-xs uppercase shadow-sm">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-900 border border-emerald-900 flex items-center justify-center">
                  <RoleIcon className={`w-2 h-2 ${roleStyle.iconColor}`} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Authorized User'}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${roleStyle.badge}`}>
                    {roleStyle.label}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/60 truncate">{user?.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-emerald-300/60 hover:text-white hover:bg-emerald-700/50 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="glass-panel border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 relative bg-white/95 backdrop-blur-md shadow-sm">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-slate-600 font-bold hidden sm:inline">Neuroviax AI</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
              <span className="text-emerald-700 font-bold capitalize bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {pageLabel}
              </span>
            </div>
          </div>

          {/* Right: Quick actions & Notifications */}
          <div className="flex items-center gap-2.5">
            {/* View Public Website Link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition border border-slate-200/80"
              title="Open Public Website in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Website</span>
            </a>


            {/* Notification Bell & Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                  showNotifs
                    ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="Notifications Center (In-App & WhatsApp)"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-84 sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-xs"
                  >
                    {/* Header */}
                    <div className="p-3.5 bg-gradient-to-r from-slate-50 to-slate-100/60 border-b border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block leading-tight">Notifications</span>
                          <span className="text-[10px] text-slate-400 block leading-tight">Real-time alerts & updates</span>
                        </div>
                        {unreadCount > 0 ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                            {unreadCount} new
                          </span>
                        ) : (
                          <span className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                            All read
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          disabled={isMarkingAllRead}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-xs transition cursor-pointer disabled:opacity-60"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isMarkingAllRead ? 'Updating...' : 'Mark all read'}</span>
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Bell className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-xs">No notifications yet</span>
                          <span className="text-[11px] text-slate-400">Alerts will appear here as activity occurs</span>
                        </div>
                      ) : (
                        notifications.slice(0, 15).map((n: any) => {
                          const isUnread = n.status === 'unread';
                          const isAnomaly = n.title?.includes('[iForest Alert]');
                          const isCampaign = n.title?.includes('Campaign Triggered');
                          return (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 transition-all flex items-start gap-3 cursor-pointer group select-none ${
                                isUnread
                                  ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-[3px] border-l-emerald-600'
                                  : 'hover:bg-slate-50/80 opacity-80 hover:opacity-100'
                              }`}
                            >
                              {/* Icon */}
                              <div className="shrink-0 mt-0.5">
                                {isAnomaly ? (
                                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                                    <ShieldAlert className="w-4 h-4" />
                                  </div>
                                ) : isCampaign ? (
                                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                ) : n.channel === 'whatsapp' ? (
                                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                                    <MessageCircle className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                                    <Bell className="w-4 h-4" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <p
                                    className={`text-xs font-semibold leading-snug line-clamp-1 ${
                                      isUnread ? 'text-slate-900 font-bold' : 'text-slate-700'
                                    }`}
                                  >
                                    {n.title}
                                  </p>
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 shrink-0 border border-slate-200/60">
                                    {n.channel === 'whatsapp' ? 'WhatsApp' : 'In-App'}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                      View details &rarr;
                                    </span>
                                    {isUnread && (
                                      <button
                                        onClick={(e) => handleMarkSingleRead(e, n._id)}
                                        className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                                        title="Mark as read"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Top Navbar Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 space-y-1.5 shadow-lg z-20"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center justify-between">
                <span>ERP Navigation</span>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Website</span>
                </a>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-slate-200 text-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.997 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.997 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
