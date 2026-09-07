import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { isUserSuperAdmin } from '../store/useAuthStore';
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
  CheckCheck,
  Home,
  Info,
  Mail,
  Globe,
  Menu,
  X,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import api from '../api/axios';

const ALL_NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'core', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'] },
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
  { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles, group: 'ai', roles: ['owner', 'admin', 'manager', 'accountant'], badge: 'AI' },
  { to: '/ai-assistants', label: 'AI Assistants', icon: Bot, group: 'ai', roles: ['owner', 'admin', 'manager', 'staff', 'accountant'], badge: 'NEW' },
];

const ROLE_STYLES: Record<string, { label: string; badge: string; icon: React.ComponentType<any>; iconColor: string }> = {
  owner: { label: 'Owner', badge: 'bg-amber-400/20 text-amber-300 border border-amber-500/40', icon: Crown, iconColor: 'text-amber-300' },
  admin: { label: 'Admin', badge: 'bg-violet-400/20 text-violet-300 border border-violet-500/40', icon: Shield, iconColor: 'text-violet-300' },
  manager: { label: 'Manager', badge: 'bg-blue-400/20 text-blue-300 border border-blue-500/40', icon: ClipboardList, iconColor: 'text-blue-300' },
  staff: { label: 'Staff', badge: 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40', icon: UserCheck, iconColor: 'text-emerald-300' },
  accountant: { label: 'Accountant', badge: 'bg-teal-400/20 text-teal-300 border border-teal-500/40', icon: CreditCard, iconColor: 'text-teal-300' },
};

const TOP_NAVBAR_ITEMS = [
  { to: '/landing', label: 'Homepage', icon: Home, badge: 'Main' },
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/about', label: 'About', icon: Info },
  { to: '/subscription/plans', label: 'Pricing & Plans', icon: Crown, badge: 'Stripe' },
  { to: '/contact', label: 'Contact', icon: Mail },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error(err);
    }
  };

  const activeMembership = user?.memberships?.[0];
  const currentRole = activeMembership?.role || 'staff';
  const roleStyle = ROLE_STYLES[currentRole] || ROLE_STYLES.staff;
  const RoleIcon = roleStyle.icon;

  const businessName = activeMembership?.business?.name || 'Primary Business';
  const pageLabel = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-300 via-emerald-400 to-teal-200 flex items-center justify-center shadow-lg shadow-emerald-950/30 shrink-0"
            >
              <Sparkles className="w-5 h-5 text-emerald-950" />
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

          {/* Exclusive Super Admin Console - Strictly for Muzammal Nazeer */}
          {isUserSuperAdmin(user) && (
            <div className="pt-2">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest px-3 pt-3 pb-1.5 flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Super Admin</span>
              </p>
              <NavLink to="/admin" className="relative block">
                {location.pathname.startsWith('/admin') && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-amber-400/20 rounded-xl border border-amber-400/40 shadow-inner"
                  />
                )}
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-amber-200 font-bold'
                      : 'text-amber-300/80 hover:text-white hover:bg-amber-400/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Admin Console</span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    OWNER
                  </span>
                </motion.div>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Security badge */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/50 rounded-lg px-3 py-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400/70 font-medium">JWT · RBAC · Audit Trail</span>
          </div>
        </div>

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

          {/* Center: Global Top Navbar Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
            {TOP_NAVBAR_ITEMS.map((item) => {
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
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-emerald-950 bg-white shadow-sm font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Badges & Notifications */}
          <div className="flex items-center gap-2.5">
            {/* JWT Token Auth Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full px-2.5 py-1 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold">Secured</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* ABOP engine badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-purple-50 border border-purple-200/60 rounded-full px-2.5 py-1">
              <Bot className="w-3 h-3 text-purple-600" />
              <span className="text-[10px] text-purple-700 font-bold">ABOP Engine</span>
            </div>

            {/* Direct WhatsApp Support */}
            <a
              href="https://wa.me/923264414694?text=Hi%20Neuroviax%20AI%20Support!%20I%20am%20messaging%20from%20my%20dashboard."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300/80 rounded-full px-3 py-1 text-emerald-800 text-xs font-bold transition shadow-xs"
              title="Chat with official support on WhatsApp: 03264414694"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              <span>WhatsApp: 03264414694</span>
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Notifications Center (In-App & WhatsApp)"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
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
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-xs"
                  >
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">Notifications</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          {unreadCount} new
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 10).map((n: any) => (
                          <div
                            key={n._id}
                            className={`p-3.5 transition-colors hover:bg-slate-50 flex items-start gap-2.5 ${
                              n.status === 'unread' ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {n.channel === 'whatsapp' ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                  <Bell className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-slate-800 truncate">{n.title}</p>
                                <span className="text-[9px] font-black px-1 rounded uppercase text-slate-400">
                                  {n.channel === 'whatsapp' ? 'WhatsApp' : 'In-App'}
                                </span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        ))
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Navigation
              </div>
              {TOP_NAVBAR_ITEMS.map((item) => {
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
