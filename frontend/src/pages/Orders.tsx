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
  Check,
  Search,
  Plus,
  X,
  FileText,
  ShoppingBag,
  Truck,
  Sparkles,
  Info,
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';

interface Order {
  _id: string;
  type: 'sales' | 'purchase';
  status: string;
  total: number;
  branch: { _id?: string; name: string };
  customer?: { _id?: string; name: string };
  supplier?: { _id?: string; name: string };
  createdAt: string;
}

interface ProductItem {
  _id: string;
  name: string;
  sku: string;
  sellPrice: number;
  costPrice: number;
}

interface BranchItem {
  _id: string;
  name: string;
}

interface PartyItem {
  _id: string;
  name: string;
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

  // Create Order Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<'sales' | 'purchase'>('sales');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [customers, setCustomers] = useState<PartyItem[]>([]);
  const [suppliers, setSuppliers] = useState<PartyItem[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get('/orders', { params: filter === 'all' ? {} : { type: filter } })
      .then((r) => setOrders(r.data.orders || []))
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  // Load auxiliary data for creating orders
  useEffect(() => {
    api.get('/products').then((r) => {
      const pList = r.data.products || (Array.isArray(r.data) ? r.data : []);
      setProducts(pList);
      if (pList.length > 0 && !selectedProduct) {
        setSelectedProduct(pList[0]._id);
        setUnitPrice(pList[0].sellPrice || pList[0].costPrice || 500);
      }
    }).catch(() => {});

    api.get('/business/branches').then((r) => {
      const bList = r.data.branches || (Array.isArray(r.data) ? r.data : []);
      setBranches(bList);
      if (bList.length > 0 && !selectedBranch) {
        setSelectedBranch(bList[0]._id);
      }
    }).catch(() => {});

    api.get('/customers').then((r) => {
      const cList = r.data.customers || (Array.isArray(r.data) ? r.data : []);
      setCustomers(cList);
    }).catch(() => {});

    api.get('/suppliers').then((r) => {
      const sList = r.data.suppliers || (Array.isArray(r.data) ? r.data : []);
      setSuppliers(sList);
    }).catch(() => {});
  }, []);

  const handleProductChange = (prodId: string) => {
    setSelectedProduct(prodId);
    const prod = products.find((p) => p._id === prodId);
    if (prod) {
      setUnitPrice(createType === 'sales' ? prod.sellPrice : prod.costPrice);
    }
  };

  const handleTypeChange = (type: 'sales' | 'purchase') => {
    setCreateType(type);
    setSelectedParty('');
    const prod = products.find((p) => p._id === selectedProduct);
    if (prod) {
      setUnitPrice(type === 'sales' ? prod.sellPrice : prod.costPrice);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!selectedProduct) {
      setCreateError('Please select at least one product.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: any = {
        type: createType,
        branch: selectedBranch || (branches[0]?._id) || 'bbbbbbbbbbbbbbbbbbbbbbbb',
        items: [
          {
            product: selectedProduct,
            quantity: Number(quantity) || 1,
            unitPrice: Number(unitPrice) || 0,
          },
        ],
        status: 'pending',
      };

      if (createType === 'sales' && selectedParty) {
        orderPayload.customer = selectedParty;
      } else if (createType === 'purchase' && selectedParty) {
        orderPayload.supplier = selectedParty;
      }

      await api.post('/orders', orderPayload);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsCreateOpen(false);
      load();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setCreateError(err?.response?.data?.message || 'Failed to create order. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Header with Create Order CTA */}
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

        <div className="flex items-center gap-3">
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

          {/* New Order Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Info Banner: Explaining How Orders Flow in Neuroviax */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50/40 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Orders Kahan Se Aate Hain?</span>
            <p className="text-slate-500 text-[11px] mt-0.5">
              1. <strong>Manual Counter:</strong> Click "+ Create Order" above. &bull; 
              2. <strong>AI Proposals:</strong> Approve reorder proposals in Recommendations. &bull; 
              3. <strong>Fulfill:</strong> "Mark Fulfilled" dabane se inventory se stock khud minus/plus ho jata hai.
            </p>
          </div>
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
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto text-xl shadow-xs">
                        🧾
                      </div>
                      <p className="font-bold text-slate-700 text-sm">Abhi tak koi order nahi hai</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Naya order banane ke liye upar <strong>"+ Create Order"</strong> button dabayein, ya AI Recommendations se auto-proposal approve karein.
                      </p>
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Pehla Order Banayein</span>
                      </button>
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
                      {o.customer?.name || o.supplier?.name || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{o.branch?.name || 'Main Store'}</span>
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
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                          >
                            Approve Order
                          </motion.button>
                        )}
                        {o.status === 'approved' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => advanceStatus(o._id, 'fulfilled')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
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

      {/* CREATE ORDER MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create New Order</h3>
                    <p className="text-xs text-slate-500">Record a customer sale or supplier restock order</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                {createError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {createError}
                  </div>
                )}

                {/* Order Type Tabs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Type</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('sales')}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        createType === 'sales'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Sales (Customer Order)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('purchase')}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        createType === 'purchase'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Purchase (Supplier Restock)</span>
                    </button>
                  </div>
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Product</label>
                  {products.length === 0 ? (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      Koi product nahi mila! Pehle "Products" page par ja kar product add karein.
                    </div>
                  ) : (
                    <select
                      value={selectedProduct}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                      required
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.sku}) &bull; ${createType === 'sales' ? p.sellPrice : p.costPrice}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Quantity & Unit Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Branch Selection */}
                {branches.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Fulfillment Branch</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                    >
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Party Selection (Customer or Supplier) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {createType === 'sales' ? 'Customer (Optional)' : 'Supplier (Optional)'}
                  </label>
                  <select
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="">{createType === 'sales' ? 'Walk-in / Anonymous Customer' : 'Standard Supplier'}</option>
                    {(createType === 'sales' ? customers : suppliers).map((party) => (
                      <option key={party._id} value={party._id}>
                        {party.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total Preview */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Calculated Total:</span>
                  <span className="text-lg font-black text-slate-900 font-display">
                    ${((Number(quantity) || 1) * (Number(unitPrice) || 0)).toLocaleString()}
                  </span>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || products.length === 0}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
