import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  PieChart,
  Calendar,
  Save,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import api from '../api/axios';

const REPORT_TABS = [
  { id: 'sales_summary', label: 'Sales Performance', icon: TrendingUp },
  { id: 'inventory_valuation', label: 'Inventory Valuation', icon: Package },
  { id: 'cash_flow', label: 'Cash Flow Forecast (FR-09)', icon: DollarSign },
  { id: 'expense_breakdown', label: 'Expense Breakdown', icon: PieChart },
];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales_summary');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [snapshotSaving, setSnapshotSaving] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const fetchLiveReport = async (type: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${type}/live`);
      setReportData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load live report', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedReports = async () => {
    try {
      const res = await api.get('/reports');
      setSavedReports(res.data || []);
    } catch (err) {
      console.error('Failed to load saved reports', err);
    }
  };

  useEffect(() => {
    fetchLiveReport(activeTab);
    fetchSavedReports();
  }, [activeTab]);

  const handleSaveSnapshot = async () => {
    setSnapshotSaving(true);
    try {
      const name = `${activeTab.replace('_', ' ').toUpperCase()} Snapshot (${new Date().toLocaleDateString('en-GB')})`;
      await api.post('/reports/generate', {
        name,
        type: activeTab,
      });
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 3000);
      fetchSavedReports();
    } catch (err) {
      console.error('Failed to save snapshot', err);
    } finally {
      setSnapshotSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
              Reports & Business Intelligence
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              AI Analytics · §6.6 & §10
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time operational snapshots and forward-looking financial forecasts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleSaveSnapshot}
            disabled={snapshotSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {snapshotSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saved to Archive</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{snapshotSaving ? 'Saving...' : 'Save Snapshot'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Computing real-time report telemetry...</div>
        ) : !reportData ? (
          <div className="p-8 text-center text-xs text-slate-400">No data available for this report type.</div>
        ) : (
          <div className="space-y-6">
            {/* Report Sub-Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display capitalize">
                  {activeTab.replace('_', ' ')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Live calculation generated at {new Date().toLocaleTimeString()}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                System Verified
              </span>
            </div>

            {/* TAB 1: Sales Summary */}
            {activeTab === 'sales_summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales Revenue</span>
                    <p className="text-xl font-black font-display text-slate-900 mt-1">
                      PKR {(reportData.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Sales Orders</span>
                    <p className="text-xl font-black font-display text-slate-900 mt-1">
                      {reportData.totalOrders || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Fulfilled Orders</span>
                    <p className="text-xl font-black font-display text-emerald-600 mt-1">
                      {reportData.completedOrdersCount || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Average Order Value</span>
                    <p className="text-xl font-black font-display text-indigo-600 mt-1">
                      PKR {(reportData.averageOrderValue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
                    Top Demand Velocity Products
                  </h4>
                  {(reportData.topProducts || []).length === 0 ? (
                    <p className="text-xs text-slate-400">No product sales velocity recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {reportData.topProducts.map((p: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs"
                        >
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {p.qty} units sold
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Inventory Valuation */}
            {activeTab === 'inventory_valuation' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inventory Valuation</span>
                  <p className="text-xl font-black font-display text-slate-900 mt-1">
                    PKR {(reportData.totalValuation || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tracked SKUs</span>
                  <p className="text-xl font-black font-display text-slate-900 mt-1">
                    {reportData.totalSKUs || 0}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Physical Units</span>
                  <p className="text-xl font-black font-display text-indigo-600 mt-1">
                    {reportData.totalUnits || 0}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Under Reorder Threshold</span>
                  <p className="text-xl font-black font-display text-amber-600 mt-1">
                    {reportData.lowStockCount || 0} items
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Cash Flow Forecast (FR-09) */}
            {activeTab === 'cash_flow' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Realized Cash Inflow</span>
                    <p className="text-xl font-black font-display text-emerald-800 mt-1">
                      PKR {(reportData.realizedInflow || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Uncollected Receivables</span>
                    <p className="text-xl font-black font-display text-blue-800 mt-1">
                      PKR {(reportData.uncollectedReceivables || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Supplier Payables</span>
                    <p className="text-xl font-black font-display text-amber-800 mt-1">
                      PKR {(reportData.pendingPayables || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Recorded Expenses</span>
                    <p className="text-xl font-black font-display text-rose-800 mt-1">
                      PKR {(reportData.recordedExpenses || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Net Projected Working Capital Position
                    </span>
                    <p className="text-2xl font-black font-display text-slate-900 mt-0.5">
                      PKR {(reportData.netProjectedPosition || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        reportData.forecastHealth === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {reportData.forecastHealth}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">FR-09 Forecast Model</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Expense Breakdown */}
            {activeTab === 'expense_breakdown' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Total Recorded Overhead Outflow:</span>
                  <span className="text-xl font-black text-slate-900">
                    PKR {(reportData.totalExpenses || 0).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(reportData.categoryBreakdown || {}).map(([cat, amount]: any) => (
                    <div
                      key={cat}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold capitalize text-slate-800">{cat.replace('_', ' ')}</span>
                      <span className="font-bold text-slate-900">PKR {amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved Reports Archive */}
      {savedReports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 font-display mb-3">Saved Report Archive</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {savedReports.map((r) => (
              <div key={r._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{r.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Type: <span className="uppercase font-semibold">{r.type.replace('_', ' ')}</span> · Saved on{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                  Archived
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
