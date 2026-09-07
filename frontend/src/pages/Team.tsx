import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  UserCog,
  Users,
  ShieldCheck,
  Plus,
  Save,
  Ban,
  CheckCircle,
  Mail,
  Crown,
  Shield,
  ClipboardList,
  UserCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Building2,
  ChevronDown,
  X,
} from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', icon: Crown, color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  { value: 'manager', label: 'Manager', icon: ClipboardList, color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'staff', label: 'Staff', icon: UserCheck, color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'accountant', label: 'Accountant', icon: CreditCard, color: 'text-teal-600', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 360, damping: 26 } },
};

const getRoleStyle = (role: string) => ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[3];

const Team: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('staff');
  const [addLoading, setAddLoading] = useState(false);

  const activeMembership = user?.memberships?.[0];
  const currentRole = activeMembership?.role || 'staff';
  const canEditRoles = currentRole === 'owner' || currentRole === 'admin';
  const canAddMembers = currentRole === 'owner' || currentRole === 'admin';
  const canDeactivate = currentRole === 'owner' || currentRole === 'admin';

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/business/members');
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    if (!canEditRoles) return;
    setSaving(userId);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/business/members/role', { userId, role: newRoleValue });
      setMembers((prev) =>
        prev.map((m) => (m._id === userId ? { ...m, role: data.role } : m))
      );
      setSuccess(`${data.name}'s role updated to ${newRoleValue}`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Role update failed');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    if (!canDeactivate) return;
    if (member.role === 'owner') {
      setError('Cannot deactivate the business owner');
      return;
    }
    setSaving(member._id);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/business/members/active', { userId: member._id });
      setMembers((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, isActive: data.isActive } : m))
      );
      setSuccess(`${data.name} ${data.isActive ? 'reactivated' : 'deactivated'}`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setSaving(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      setError('All fields are required');
      return;
    }
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/business/members', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setMembers((prev) => [...prev, data]);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
      setSuccess(`${data.name} added as ${data.role}`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add team member');
    } finally {
      setAddLoading(false);
    }
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.isActive).length,
    admins: members.filter((m) => m.role === 'owner' || m.role === 'admin').length,
    staff: members.filter((m) => m.role === 'staff').length,
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
            Team & Role Administration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage team members, assign roles, and control workspace access. RBAC-enforced.
          </p>
        </div>
        {canAddMembers && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-violet-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </motion.button>
        )}
      </motion.div>

      {/* ── Notifications ─────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.total, icon: Users, color: 'from-slate-500/15 to-slate-400/10', iconColor: 'text-slate-600', textColor: 'text-slate-800' },
          { label: 'Active Users', value: stats.active, icon: CheckCircle, color: 'from-emerald-500/15 to-teal-500/10', iconColor: 'text-emerald-600', textColor: 'text-emerald-700' },
          { label: 'Owners / Admins', value: stats.admins, icon: ShieldCheck, color: 'from-violet-500/15 to-purple-500/10', iconColor: 'text-violet-600', textColor: 'text-violet-700' },
          { label: 'Staff Level', value: stats.staff, icon: UserCheck, color: 'from-blue-500/15 to-indigo-500/10', iconColor: 'text-blue-600', textColor: 'text-blue-700' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={cardVariants}
              whileHover={{ y: -2 }}
              className="glass-card rounded-2xl p-4 shadow-elevated"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
              </div>
              <p className={`text-2xl font-black font-display tracking-tight ${s.textColor}`}>{s.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Current User Role Note ─────────────────────────── */}
      <motion.div variants={cardVariants} className="glass-card rounded-2xl p-4 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-200/60 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Your current workspace role</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Viewing <span className="font-semibold text-violet-700">{activeMembership?.business?.name || 'Primary Business'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const rs = getRoleStyle(currentRole);
              const RIcon = rs.icon;
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wide ${rs.badge}`}>
                  <RIcon className="w-3.5 h-3.5" />
                  {rs.label}
                </span>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* ── Team Members Table ─────────────────────────────── */}
      <motion.div variants={cardVariants} className="glass-card rounded-2xl shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 pb-4">
          <div>
            <h3 className="font-black font-display text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Team Directory
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{members.length} team member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <p className="text-xs text-slate-500 mt-3">Loading team members…</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">No team members yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Invite your first team member to get started with role-based collaboration.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3 font-black">Member</th>
                  <th className="px-5 py-3 font-black">Role</th>
                  <th className="px-5 py-3 font-black hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3 font-black hidden md:table-cell">Last Seen</th>
                  <th className="px-5 py-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {members.map((member) => {
                  const rs = getRoleStyle(member.role);
                  const RIcon = rs.icon;
                  const isSelf = user?._id === member._id;
                  return (
                    <motion.tr
                      key={member._id}
                      variants={cardVariants}
                      whileHover={{ backgroundColor: 'rgba(248,250,252,0.6)' }}
                      className="transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                            member.role === 'owner' ? 'from-amber-400/30 to-orange-400/20 border-amber-300/40' :
                            member.role === 'admin' ? 'from-violet-400/30 to-purple-400/20 border-violet-300/40' :
                            member.role === 'manager' ? 'from-blue-400/30 to-indigo-400/20 border-blue-300/40' :
                            'from-emerald-400/30 to-teal-400/20 border-emerald-300/40'
                          } border flex items-center justify-center text-slate-700 font-black text-sm uppercase shrink-0`}>
                            {member.name?.[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {member.name}
                                {isSelf && <span className="text-[9px] ml-1 text-slate-400 font-medium">(you)</span>}
                              </p>
                              {member.role === 'owner' && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <Mail className="w-2.5 h-2.5 shrink-0 opacity-60" />
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {canEditRoles && !isSelf && member.role !== 'owner' ? (
                          <div className="relative w-full max-w-[160px]">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member._id, e.target.value)}
                              disabled={saving === member._id}
                              className={`w-full appearance-none pl-7 pr-7 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:opacity-60 disabled:cursor-not-allowed ${rs.badge}`}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <RIcon className={`w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${rs.color}`} />
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${rs.badge}`}>
                            <RIcon className="w-3 h-3" />
                            {rs.label}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        {member.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-[11px] text-slate-500 font-medium">
                          {member.lastLoginAt
                            ? new Date(member.lastLoginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : member.createdAt
                            ? `Joined ${new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                            : '—'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canDeactivate && !isSelf && member.role !== 'owner' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {saving === member._id ? (
                              <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToggleActive(member)}
                                title={member.isActive ? 'Deactivate' : 'Reactivate'}
                                className={`p-1.5 rounded-lg transition ${
                                  member.isActive
                                    ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {member.isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              </motion.button>
                            )}
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300">
                              <MoreHorizontal className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-medium">
                            {isSelf ? 'Current user' : 'Protected'}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* ── Add Member Modal ─────────────────────────────── */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
          onClick={() => !addLoading && setShowAddModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black font-display text-slate-900 text-sm">Add Team Member</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Invite a new member with role-based access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !addLoading && setShowAddModal(false)}
                disabled={addLoading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-violet-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-violet-500" />
                  Work Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-violet-500" />
                    Temporary Password
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Min 8 chars</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set an initial password"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-violet-500" />
                  Assign Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => {
                    const RIcon = r.icon;
                    const selected = newRole === r.value;
                    return (
                      <motion.button
                        key={r.value}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNewRole(r.value)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                          selected
                            ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-400 ring-2 ring-violet-400/30'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected ? 'bg-violet-100' : 'bg-white border border-slate-200'}`}>
                          <RIcon className={`w-3.5 h-3.5 ${r.color}`} />
                        </div>
                        <div>
                          <p className={`text-[11px] font-black ${selected ? 'text-violet-800' : 'text-slate-700'}`}>{r.label}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => !addLoading && setShowAddModal(false)}
                  disabled={addLoading}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-2.5 text-xs transition disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={addLoading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl py-2.5 text-xs shadow-lg shadow-violet-500/25 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{addLoading ? 'Adding…' : 'Add Member'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Team;
