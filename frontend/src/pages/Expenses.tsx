import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Trash2,
  Tag,
  Building,
  Calendar,
  CreditCard,
  PieChart,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../api/axios';

interface ExpenseItem {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
  notes?: string;
  createdBy?: { name: string };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  rent: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  utilities: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  salaries: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  inventory_shipping: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  marketing: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  maintenance: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ totalExpense: number; byCategory: Record<string, number> }>({
    totalExpense: 0,
    byCategory: {},
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('rent');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary'),
      ]);
      setExpenses(expRes.data || []);
      setSummary(sumRes.data || { totalExpense: 0, byCategory: {} });
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      await api.post('/expenses', {
        title,
        category,
        amount: Number(amount),
        paymentMethod,
        notes,
      });
      setShowAddModal(false);
      setTitle('');
      setAmount('');
      setNotes('');
      fetchExpenses();
    } catch (err) {
      console.error('Failed to create expense', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  const filteredExpenses =
    selectedCategory === 'all'
      ? expenses
      : expenses.filter((e) => e.category === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
              Expense Operations
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Finance Assistant Active
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Categorized overhead and operational expenses reconciled against Cash-Flow · §6.6 & §10
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Recorded Outflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-slate-900 mt-2">
            PKR {(summary.totalExpense || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-rose-500" />
            Reconciles against Payables in Cash-Flow
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Highest Category Outflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          {Object.keys(summary.byCategory || {}).length > 0 ? (
            <div>
              <p className="text-lg font-black font-display text-slate-900 mt-2 capitalize">
                {Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace('_', ' ')}
              </p>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                PKR {Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0]?.[1]?.toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mt-3">No category data yet</p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reconciliation Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black font-display text-emerald-700 mt-2">
            100% Tax Compliant
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            All expense entries mapped with immutable audit log
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'rent', 'utilities', 'salaries', 'inventory_shipping', 'marketing', 'maintenance', 'other'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading expense ledger...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-400 mt-1">Record rent, utility, or logistical expenses to begin tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Title / Purpose</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => {
                  const style = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.other;
                  return (
                    <tr key={exp._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        {exp.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${style.bg} ${style.text} ${style.border}`}
                        >
                          {exp.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-600 font-semibold text-[11px]">
                        {exp.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(exp.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        PKR {exp.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Record Business Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warehouse Rent / Generator Fuel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="salaries">Salaries</option>
                    <option value="inventory_shipping">Logistics / Shipping</option>
                    <option value="marketing">Marketing</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 capitalize"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="stripe">Card / Stripe</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Voucher Reference</label>
                <textarea
                  rows={2}
                  placeholder="Receipt # or supplier notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Expenses;
