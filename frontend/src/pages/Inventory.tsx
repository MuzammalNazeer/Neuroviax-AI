import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Warehouse,
  Package,
  Plus,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  X,
  RefreshCw,
  Sparkles,
  Boxes,
} from 'lucide-react';

interface InventoryItem {
  _id: string;
  product: { _id: string; name: string; sku: string; reorderThreshold: number };
  branch: { _id: string; name: string };
  quantity: number;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  reorderThreshold?: number;
}

interface Branch {
  _id: string;
  name: string;
  type?: string;
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ product: '', branch: '', type: 'in', quantity: 1, reason: '' });

  // Quick branch creation state
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [branchCreating, setBranchCreating] = useState(false);

  // Table filters
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const load = () => {
    setLoading(true);
    setError(null);

    Promise.allSettled([
      api.get('/inventory'),
      api.get('/products', { params: { limit: 100 } }),
      api.get('/business/branches'),
    ]).then(([invRes, prodRes, brRes]) => {
      const errors: string[] = [];

      if (invRes.status === 'fulfilled') {
        setItems(invRes.value.data ?? []);
      } else {
        const msg = (invRes.reason as any)?.response?.data?.message ?? invRes.reason?.message;
        errors.push(`Inventory: ${msg}`);
      }

      let loadedProducts: Product[] = [];
      if (prodRes.status === 'fulfilled') {
        loadedProducts = prodRes.value.data?.products ?? [];
        setProducts(loadedProducts);
      } else {
        const msg = (prodRes.reason as any)?.response?.data?.message ?? prodRes.reason?.message;
        errors.push(`Products: ${msg}`);
      }

      let loadedBranches: Branch[] = [];
      if (brRes.status === 'fulfilled') {
        loadedBranches = brRes.value.data ?? [];
        setBranches(loadedBranches);
      } else {
        const msg = (brRes.reason as any)?.response?.data?.message ?? brRes.reason?.message;
        errors.push(`Branches: ${msg}`);
      }

      // Automatically default form fields if not set yet
      setForm((prev) => ({
        ...prev,
        product: prev.product || (loadedProducts[0]?._id ?? ''),
        branch: prev.branch || (loadedBranches[0]?._id ?? ''),
      }));

      if (errors.length > 0) {
        setError(errors.join(' | '));
      }
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setBranchCreating(true);
    try {
      const res = await api.post('/business/branches', {
        name: newBranchName.trim(),
        type: 'both',
      });
      const newB: Branch = res.data;
      setBranches((prev) => [...prev, newB]);
      setForm((prev) => ({ ...prev, branch: newB._id }));
      setNewBranchName('');
      setShowNewBranchInput(false);
      setFormSuccess(`Branch "${newB.name}" created and selected!`);
      setTimeout(() => setFormSuccess(null), 3500);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create branch');
    } finally {
      setBranchCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.product) {
      setFormError('Please select a product');
      return;
    }
    if (!form.branch) {
      setFormError('Please select or create a branch');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inventory/movement', form);
      setFormSuccess('Movement recorded successfully!');
      confetti({ particleCount: 55, spread: 70, origin: { y: 0.5 } });
      setTimeout(() => setFormSuccess(null), 3500);
      setForm((prev) => ({ ...prev, quantity: 1, reason: '' }));
      load();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || err?.message || 'Failed to save movement'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelogin = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Currently selected product in the movement form
  const selectedProduct = products.find((p) => p._id === form.product);

  // Filter items for table
  const filteredItems = items.filter((item) => {
    if (selectedProductFilter !== 'all' && item.product?._id !== selectedProductFilter) {
      return false;
    }
    if (selectedBranchFilter !== 'all' && item.branch?._id !== selectedBranchFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const pName = item.product?.name?.toLowerCase() || '';
      const pSku = item.product?.sku?.toLowerCase() || '';
      const bName = item.branch?.name?.toLowerCase() || '';
      return pName.includes(q) || pSku.includes(q) || bName.includes(q);
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Error Banner with quick recovery */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="bg-rose-50/90 backdrop-blur-md border border-rose-200/80 text-rose-800 text-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={load}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRelogin}
                className="border border-rose-300 bg-white hover:bg-rose-50 text-rose-800 text-xs px-3.5 py-1.5 rounded-lg font-semibold shadow-xs transition"
              >
                Re-login
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Inventory Management</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              FR-02
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Multi-branch stock tracking, cycle count adjustments, and real-time replenishment signals.</p>
        </div>
        <div className="flex items-center gap-3">
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
            <span>{showForm ? 'Close Form' : 'Record Stock Movement'}</span>
          </motion.button>
        </div>
      </div>

      {/* Movement Recording Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-6 shadow-elevated space-y-5 border border-slate-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Record In/Out Stock Movement</h3>
                    <p className="text-[11px] text-slate-400">Receive goods, pick for delivery, or adjust physical cycle counts.</p>
                  </div>
                </div>
                {branches.length === 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1 rounded-full font-semibold">
                    No branches registered
                  </span>
                )}
              </div>

              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-2.5 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </motion.div>
              )}

              {formSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl px-4 py-2.5 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Product</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Select with Quick Add */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Select Branch / Warehouse</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewBranchInput(!showNewBranchInput)}
                      className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 hover:underline"
                    >
                      {showNewBranchInput ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{showNewBranchInput ? 'Cancel' : 'New Branch'}</span>
                    </button>
                  </div>

                  {showNewBranchInput ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Warehouse or Branch name"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="flex-1 border border-emerald-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                      />
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        disabled={branchCreating || !newBranchName.trim()}
                        onClick={handleCreateBranch}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-xs transition"
                      >
                        {branchCreating ? 'Saving…' : 'Add'}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <select
                      required
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                    >
                      <option value="">-- Choose Branch / Warehouse --</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name} {b.type ? `(${b.type})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Movement Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Action Type</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
                  >
                    <option value="in">📥 Stock In (Receiving)</option>
                    <option value="out">📤 Stock Out (Picking / Sales)</option>
                    <option value="adjustment_add">➕ Cycle Count Adjustment (+)</option>
                    <option value="adjustment_remove">➖ Cycle Count Adjustment (-)</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 25"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-bold"
                  />
                </div>

                {/* Reason / Reference Note */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Reference Note / Reason</label>
                  <input
                    placeholder="e.g. Restock shipment from supplier, damaged carton return, etc."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Selected Product Branch Breakdown Card */}
                {selectedProduct && branches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-slate-50/50 border border-emerald-200/70 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Branch Stock Levels for: <span className="text-emerald-800 font-extrabold">{selectedProduct.name}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Click a branch to auto-select</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {branches.map((b) => {
                        const inv = items.find(
                          (item) => item.product?._id === selectedProduct._id && item.branch?._id === b._id
                        );
                        const qty = inv ? inv.quantity : 0;
                        const isSelected = form.branch === b._id;

                        return (
                          <motion.button
                            key={b._id}
                            type="button"
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setForm({ ...form, branch: b._id })}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                                : 'bg-white/80 border-slate-200/80 hover:border-emerald-300'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{b.name}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 capitalize">{b.type || 'branch'}</p>
                            </div>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-black ${
                                qty > 0
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {qty} in stock
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Submit */}
                <div className="md:col-span-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl py-3 text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>Saving Movement…</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Save Stock Movement</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Overview Controls Bar */}
      <div className="glass-card rounded-2xl p-4 shadow-elevated flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-slate-200/80">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Instant Search */}
          <div className="relative min-w-[220px] flex-1">
            <input
              type="text"
              placeholder="Search product name, SKU, or warehouse…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Filter by Product */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Product:</span>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
            >
              <option value="all">All Products ({products.length})</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Branch */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Branch:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
            >
              <option value="all">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters button */}
        {(selectedProductFilter !== 'all' || selectedBranchFilter !== 'all' || searchQuery) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedProductFilter('all');
              setSelectedBranchFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline self-end md:self-center px-2 py-1"
          >
            Clear Filters
          </motion.button>
        )}
      </div>

      {/* Inventory Items Table */}
      <div className="glass-card rounded-2xl shadow-elevated overflow-hidden border border-slate-200/80">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 font-display text-sm">
            {selectedProductFilter !== 'all'
              ? `Stock across branches for: ${products.find((p) => p._id === selectedProductFilter)?.name || 'Product'}`
              : selectedBranchFilter !== 'all'
              ? `Products in branch: ${branches.find((b) => b._id === selectedBranchFilter)?.name || 'Branch'}`
              : 'Current Stock Master Records'}
          </h3>
          <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
            {filteredItems.length} {filteredItems.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">SKU Code</th>
                <th className="px-6 py-3.5">Location / Branch</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Reorder Level</th>
                <th className="px-6 py-3.5">Inventory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span className="font-medium text-xs">Loading live inventory…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                        📦
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No inventory records</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Click "Record Stock Movement" above to receive inventory into your branches.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredItems.map((i, idx) => {
                const threshold = i.product?.reorderThreshold ?? 10;
                const isLow = i.quantity <= threshold;
                const isOutOfStock = i.quantity <= 0;

                return (
                  <motion.tr
                    key={i._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                      {i.product?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {i.product?.sku || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{i.branch?.name || 'Main Branch'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black font-display text-sm">
                      <span className={isOutOfStock ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}>
                        {i.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{threshold}</td>
                    <td className="px-6 py-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          In Stock
                        </span>
                      )}
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

export default Inventory;
