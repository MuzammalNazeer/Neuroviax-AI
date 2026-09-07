import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Package,
  Plus,
  Search,
  Tag,
  DollarSign,
  Boxes,
  CheckCircle2,
  X,
  TrendingUp,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  reorderThreshold: number;
}

const emptyForm = { name: '', sku: '', unit: 'pcs', costPrice: 0, sellPrice: 0, reorderThreshold: 10 };

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/products')
      .then((r) => setProducts(r.data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/products', form);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
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
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Package className="w-4 h-4" />
            </span>
            <span>Products Master Catalog</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              FR-01
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Global SKU catalog, cost/sell price matrices, and dynamic reorder threshold settings.
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
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Create New Product'}</span>
        </motion.button>
      </div>

      {/* Product Creation Drawer */}
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
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Product Specifications</h3>
                </div>
                <span className="text-[11px] text-slate-400">All fields will synchronize across branch warehouses</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    placeholder="e.g. Basmati Rice 5kg"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Barcode *</label>
                  <input
                    placeholder="e.g. RICE-5KG"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    placeholder="e.g. bag, pcs, kg, box"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.sellPrice}
                    onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="10"
                    value={form.reorderThreshold}
                    onChange={(e) => setForm({ ...form, reorderThreshold: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Creating Product…' : 'Save Product into Catalog'}</span>
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
            placeholder="Search by product name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-full">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
        </span>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl shadow-elevated overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU Code</th>
                <th className="px-6 py-3.5">Cost Price</th>
                <th className="px-6 py-3.5">Sell Price</th>
                <th className="px-6 py-3.5">Unit Margin</th>
                <th className="px-6 py-3.5">Reorder Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span>Loading products…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                        📦
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No products found</p>
                      <p className="text-[11px] text-slate-400">Click "Create New Product" above to add your first SKU.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredProducts.map((p, idx) => {
                const margin = p.sellPrice - p.costPrice;
                const marginPct = p.costPrice > 0 ? Math.round((margin / p.costPrice) * 100) : 0;

                return (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      ${p.costPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${p.sellPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          margin >= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>+${margin} ({marginPct}%)</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {p.reorderThreshold} {p.unit}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Products;
