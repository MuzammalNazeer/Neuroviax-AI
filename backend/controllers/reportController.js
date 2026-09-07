const asyncHandler = require('../utils/asyncHandler');
const Report = require('../models/Report');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const { logAction } = require('../utils/audit');

// Helper to calculate live report data
async function calculateReportData(businessId, type) {
  if (type === 'sales_summary') {
    const orders = await Order.find({ business: businessId, type: 'sales' }).populate('items.product', 'name');
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = orders.filter((o) => ['approved', 'fulfilled', 'delivered'].includes(o.status));
    
    // Product frequency
    const productMap = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const pName = item.product?.name || 'Product';
        productMap[pName] = (productMap[pName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalRevenue: totalSales,
      totalOrders: orders.length,
      completedOrdersCount: completedOrders.length,
      averageOrderValue: orders.length ? Math.round(totalSales / orders.length) : 0,
      topProducts,
    };
  }

  if (type === 'inventory_valuation') {
    const items = await Inventory.find({ business: businessId }).populate('product', 'name sku costPrice reorderThreshold');
    let totalValue = 0;
    let totalUnits = 0;
    let lowStockCount = 0;

    items.forEach((item) => {
      const qty = item.quantity || 0;
      const cost = item.product?.costPrice || 0;
      totalUnits += qty;
      totalValue += qty * cost;
      if (item.product && qty <= (item.product.reorderThreshold || 10)) {
        lowStockCount++;
      }
    });

    return {
      totalSKUs: items.length,
      totalUnits,
      totalValuation: totalValue,
      lowStockCount,
    };
  }

  if (type === 'cash_flow') {
    const payments = await Payment.find({ business: businessId });
    const expenses = await Expense.find({ business: businessId });

    const receivables = payments
      .filter((p) => p.direction === 'receivable' && p.status === 'pending')
      .reduce((s, p) => s + (p.amount || 0), 0);

    const received = payments
      .filter((p) => p.direction === 'receivable' && p.status === 'completed')
      .reduce((s, p) => s + (p.amount || 0), 0);

    const payables = payments
      .filter((p) => p.direction === 'payable' && p.status === 'pending')
      .reduce((s, p) => s + (p.amount || 0), 0);

    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    const netProjected = (received + receivables) - (payables + totalExpenses);

    return {
      uncollectedReceivables: receivables,
      realizedInflow: received,
      pendingPayables: payables,
      recordedExpenses: totalExpenses,
      netProjectedPosition: netProjected,
      forecastHealth: netProjected >= 0 ? 'Healthy' : 'Deficit Warning',
    };
  }

  if (type === 'expense_breakdown') {
    const expenses = await Expense.find({ business: businessId });
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });

    return {
      totalExpenses: total,
      expensesCount: expenses.length,
      categoryBreakdown: categoryTotals,
    };
  }

  return {};
}

// @desc  Get live calculation for a specific report type
// @route GET /api/reports/:type/live
const getLiveReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const validTypes = ['sales_summary', 'inventory_valuation', 'cash_flow', 'expense_breakdown'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid report type' });
  }

  const data = await calculateReportData(req.businessId, type);
  res.json({ type, generatedAt: new Date(), data });
});

// @desc  List saved reports
// @route GET /api/reports
const listSavedReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ business: req.businessId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(reports);
});

// @desc  Save / Snapshot a report
// @route POST /api/reports/generate
const saveReportSnapshot = asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: 'Report name and type are required' });
  }

  const data = await calculateReportData(req.businessId, type);

  const report = await Report.create({
    business: req.businessId,
    name,
    type,
    summaryData: data,
    createdBy: req.user._id,
  });

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'report.generated',
    entityType: 'Report',
    entityId: report._id,
    metadata: { name: report.name, type: report.type },
  });

  res.status(201).json(report);
});

module.exports = {
  getLiveReport,
  listSavedReports,
  saveReportSnapshot,
};
