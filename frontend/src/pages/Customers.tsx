import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  MessageSquareOff,
  CheckCircle2,
  Check,
  X,
  Search,
  Sparkles,
  Send,
  RotateCcw,
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsappOptIn: boolean;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', whatsappOptIn: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/customers').then((r) => setCustomers(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleWhatsApp = async (customer: Customer) => {
    setUpdatingId(customer._id);
    const newStatus = !customer.whatsappOptIn;
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => (c._id === customer._id ? { ...c, whatsappOptIn: newStatus } : c))
    );

    try {
      await api.patch(`/customers/${customer._id}/toggle-whatsapp`, { whatsappOptIn: newStatus });
      showToast(`WhatsApp Opt-In ${newStatus ? 'enabled' : 'disabled'} for ${customer.name}`);
    } catch (err) {
      // Fallback to PUT
      try {
        await api.put(`/customers/${customer._id}`, { whatsappOptIn: newStatus });
        showToast(`WhatsApp Opt-In ${newStatus ? 'enabled' : 'disabled'} for ${customer.name}`);
      } catch (err2) {
        // Revert on error
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, whatsappOptIn: !newStatus } : c))
        );
        showToast(`Failed to update WhatsApp opt-in for ${customer.name}`);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetOptIn = async (customer: Customer) => {
    setUpdatingId(customer._id);
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => (c._id === customer._id ? { ...c, whatsappOptIn: false } : c))
    );

    try {
      await api.patch(`/customers/${customer._id}/toggle-whatsapp`, { whatsappOptIn: false });
      showToast(`WhatsApp Opt-In reset to Disabled for ${customer.name}`);
    } catch (err) {
      try {
        await api.put(`/customers/${customer._id}`, { whatsappOptIn: false });
        showToast(`WhatsApp Opt-In reset to Disabled for ${customer.name}`);
      } catch (err2) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, whatsappOptIn: true } : c))
        );
        showToast(`Failed to reset WhatsApp opt-in for ${customer.name}`);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/customers', form);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
    setShowForm(false);
    setForm({ name: '', phone: '', email: '', whatsappOptIn: false });
    load();
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Users className="w-4 h-4" />
            </span>
            <span>Customer Directory</span>
            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              CRM Foundation
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Omnichannel buyer accounts with WhatsApp notification preferences and purchase history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/customer-segmentation"
            className="text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 text-purple-300 border border-purple-500/30 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Segmentation (K-Means)</span>
          </Link>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 ${
              showForm
                ? 'bg-slate-800 hover:bg-slate-900 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/20'
            }`}
          >
            {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{showForm ? 'Cancel' : 'Add New Customer'}</span>
          </motion.button>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 shadow-elevated border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Customer Profile Details</h3>
                <span className="text-[11px] text-slate-400">Used for automated dispatch & invoicing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    placeholder="e.g. John Doe"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    placeholder="e.g. +1 555-0199"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.whatsappOptIn}
                      onChange={(e) => setForm({ ...form, whatsappOptIn: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Opt in customer for automated WhatsApp delivery & dispatch tracking</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Customer Record</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 shadow-elevated flex items-center justify-between gap-4 border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by customer name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-full">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'}
        </span>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customers Table */}
      <div className="glass-card rounded-2xl shadow-elevated overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Contact Phone</th>
                <th className="px-6 py-3.5">Email Address</th>
                <th className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span>WhatsApp Opt-In</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded-full lowercase">
                      {customers.filter((c) => c.whatsappOptIn).length} enabled
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400" colSpan={4}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span>Loading customer accounts…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={4}>
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto text-xl">
                        👥
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No customers found</p>
                      <p className="text-[11px] text-slate-400">Add buyers to initiate sales orders and invoice notifications.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredCustomers.map((c, idx) => (
                <motion.tr
                  key={c._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                    {c.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.email || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Interactive WhatsApp Opt-In Toggle Pill */}
                      <button
                        onClick={() => handleToggleWhatsApp(c)}
                        disabled={updatingId === c._id}
                        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none border shadow-xs ${
                          c.whatsappOptIn
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/80 hover:text-slate-800'
                        } ${updatingId === c._id ? 'opacity-60 cursor-wait' : ''}`}
                        title={`Click to ${c.whatsappOptIn ? 'Disable / Reset' : 'Enable'} WhatsApp Opt-In for ${c.name}`}
                      >
                        {updatingId === c._id ? (
                          <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        ) : c.whatsappOptIn ? (
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <MessageSquareOff className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                        )}
                        <span>{c.whatsappOptIn ? 'Enabled' : 'Disabled'}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-slate-600 font-semibold ml-0.5">
                          (Toggle)
                        </span>
                      </button>

                      {/* Direct WhatsApp Chat Action Button */}
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(c.name)}!%20Your%20order%20updates%20are%20active.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg border transition ${
                            c.whatsappOptIn
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white shadow-xs'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600 opacity-60'
                          }`}
                          title={`Open WhatsApp chat with ${c.name} (${c.phone})`}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Reset Opt-In to Disabled Button (only when enabled) */}
                      {c.whatsappOptIn && (
                        <button
                          onClick={() => handleResetOptIn(c)}
                          disabled={updatingId === c._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer"
                          title={`Reset WhatsApp Opt-In to Disabled for ${c.name}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Customers;
