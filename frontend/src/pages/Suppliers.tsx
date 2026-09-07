import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Truck,
  UserPlus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  leadTimeDays: number;
  reliabilityScore: number;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', leadTimeDays: 7, reliabilityScore: 70 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/suppliers').then((r) => setSuppliers(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/suppliers', form);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
    setShowForm(false);
    setForm({ name: '', phone: '', leadTimeDays: 7, reliabilityScore: 70 });
    load();
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.phone && s.phone.includes(q));
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
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Truck className="w-4 h-4" />
            </span>
            <span>Supplier Network</span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              FR-06
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Vendor lead-time metrics and reliability scoring evaluated by the AI Procurement Assistant.
          </p>
        </div>

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
          <span>{showForm ? 'Cancel' : 'Add New Supplier'}</span>
        </motion.button>
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
                <h3 className="font-bold text-slate-900 text-sm">Vendor Profile & Metrics</h3>
                <span className="text-[11px] text-slate-400">Used by AI algorithm to estimate restock velocity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Company Name *</label>
                  <input
                    placeholder="e.g. Alpha Distributors"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    placeholder="e.g. +1 555-0182"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="7"
                    value={form.leadTimeDays}
                    onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reliability Score (0–100%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="70"
                    value={form.reliabilityScore}
                    onChange={(e) => setForm({ ...form, reliabilityScore: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-bold"
                  />
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
                  <span>Save Supplier to Vendor Network</span>
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
            placeholder="Search by supplier name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-full">
          {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'Supplier' : 'Suppliers'}
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="glass-card rounded-2xl shadow-elevated overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Supplier Name</th>
                <th className="px-6 py-3.5">Phone Contact</th>
                <th className="px-6 py-3.5">Estimated Lead Time</th>
                <th className="px-6 py-3.5">Reliability Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400" colSpan={4}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span>Loading vendors…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredSuppliers.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={4}>
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-xl">
                        🚚
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No suppliers registered</p>
                      <p className="text-[11px] text-slate-400">Add suppliers to empower the AI Procurement Assistant.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredSuppliers.map((s, idx) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                    {s.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.leadTimeDays} days</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.reliabilityScore}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${
                            s.reliabilityScore >= 80
                              ? 'bg-emerald-500'
                              : s.reliabilityScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <span className="font-bold text-slate-700 text-[11px]">{s.reliabilityScore}%</span>
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

export default Suppliers;
