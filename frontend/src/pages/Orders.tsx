import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  Search,
  Sparkles,
  FileText,
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';

interface Order {
  _id: string;
  type: 'sales' | 'purchase';
  status: string;
  total: number;
  branch: { name: string };
  customer?: { name: string };
  supplier?: { name: string };
  createdAt: string;
}

const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  approved: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  fulfilled: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  returned: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'sales' | 'purchase'>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get('/orders', { params: filter === 'all' ? {} : { type: filter } })
      .then((r) => setOrders(r.data.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const advanceStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    if (status === 'fulfilled') {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }
    load();
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const party = (o.customer?.name || o.supplier?.name || '').toLowerCase();
    const branch = (o.branch?.name || '').toLowerCase();
    return party.includes(q) || branch.includes(q) || o._id.toLowerCase().includes(q);
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
            <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Receipt className="w-4 h-4" />
            </span>
            <span>Orders Management</span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              FR-05
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Unified sales & purchase order pipeline. Fulfilling orders triggers automated multi-branch inventory updates.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['all', 'sales', 'purchase'] as const).map((f) => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f} Orders
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 shadow-elevated flex items-center justify-between gap-4 border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search party, supplier, customer, or branch…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-full">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl shadow-elevated overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Customer / Supplier</th>
                <th className="px-6 py-3.5">Fulfillment Branch</th>
                <th className="px-6 py-3.5">Order Total</th>
                <th className="px-6 py-3.5">Lifecycle Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span>Loading order stream…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto text-xl">
                        🧾
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No orders yet</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Approve proposals from AI Recommendations or record orders manually to track customer deliveries.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredOrders.map((o, idx) => {
                const isSales = o.type === 'sales';
                const badge = statusBadges[o.status] || statusBadges.draft;

                return (
                  <motion.tr
                    key={o._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isSales
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {isSales ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        <span>{o.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                      {o.customer?.name || o.supplier?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{o.branch?.name || 'Main Branch'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black font-display text-slate-900 text-sm">
                      ${o.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 border text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{o.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInvoiceOrder(o)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
                          title="Generate Jurisdiction Tax Invoice (FR-08)"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Invoice</span>
                        </button>
                        {o.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => advanceStatus(o._id, 'approved')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                          >
                            Approve Order
                          </motion.button>
                        )}
                        {o.status === 'approved' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => advanceStatus(o._id, 'fulfilled')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Fulfilled</span>
                          </motion.button>
                        )}
                        {o.status === 'fulfilled' && (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fulfilled</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FR-08 Tax Invoice Modal */}
      <InvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
      />
    </motion.div>
  );
};

export default Orders;
