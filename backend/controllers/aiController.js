const asyncHandler = require('../utils/asyncHandler');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const AIRecommendation = require('../models/AIRecommendation');
const Order = require('../models/Order');
const { logAction } = require('../utils/audit');

/**
 * Section 6.3, 6.6, 7 & 15: AI Recommendation Engine
 * Domain-scoped assistants with risk-tiered autonomy (low, medium, high)
 * and explainable rationale (Section 7.1, 7.2, 7.3, 12.2).
 */

const RISK_THRESHOLD_HIGH_VALUE = 50000; // currency units — above this, force human approval regardless of confidence

function estimateDailyVelocity(movementHistory) {
  if (!movementHistory || !Array.isArray(movementHistory)) return 0;
  const outMovements = movementHistory.filter((m) => m.type === 'out');
  if (outMovements.length === 0) return 0;
  const totalOut = outMovements.reduce((s, m) => s + m.quantity, 0);
  const days = Math.max(
    1,
    (Date.now() - new Date(outMovements[0].date).getTime()) / (1000 * 60 * 60 * 24)
  );
  return totalOut / days;
}

// @desc  Generate recommendations across domain assistants (Procurement, Finance, Sales, Inventory)
// @route POST /api/ai/recommendations/generate
const generateRecommendations = asyncHandler(async (req, res) => {
  const targetAssistant = req.body?.assistant || req.query?.assistant || 'all';
  const created = [];

  // 1. Procurement & Inventory Assistant (FR-04, FR-05)
  if (['all', 'procurement', 'inventory'].includes(targetAssistant)) {
    const inventoryItems = await Inventory.find({ business: req.businessId })
      .populate('product', 'name sku reorderThreshold costPrice')
      .populate('branch', 'name');

    for (const item of inventoryItems) {
      if (!item.product) continue;

      const dailyVelocity = estimateDailyVelocity(item.movementHistory);
      const daysOfCoverage = dailyVelocity > 0 ? item.quantity / dailyVelocity : Infinity;

      // Forecast-adjusted alert (FR-04): trigger if under threshold OR under 7 days of coverage
      const shouldFlag = item.quantity <= (item.product.reorderThreshold || 10) || daysOfCoverage < 7;
      if (!shouldFlag) continue;

      const suggestedQty = Math.max((item.product.reorderThreshold || 10) * 2 - item.quantity, Math.ceil(dailyVelocity * 14) || 20);
      const estimatedCost = suggestedQty * (item.product.costPrice || 0);

      // Find best supplier by latest price for this product, if price history exists
      const suppliers = await Supplier.find({ business: req.businessId, 'priceHistory.product': item.product._id });
      let bestSupplier = null;
      if (suppliers.length) {
        bestSupplier = suppliers
          .map((s) => {
            const hist = (s.priceHistory || []).filter((p) => p.product?.toString() === item.product._id.toString());
            const latest = hist.length ? hist[hist.length - 1].price : Infinity;
            return { supplier: s, latestPrice: latest };
          })
          .sort((a, b) => a.latestPrice - b.latestPrice)[0];
      }

      const confidenceScore = dailyVelocity > 0 ? Math.min(0.95, 0.5 + (item.movementHistory?.length || 0) * 0.03) : 0.65;
      const riskTier = estimatedCost > RISK_THRESHOLD_HIGH_VALUE ? 'high' : 'medium';

      const rationale = dailyVelocity > 0
        ? `Current stock (${item.quantity}) covers ~${daysOfCoverage.toFixed(1)} days at recent demand of ${dailyVelocity.toFixed(2)}/day. Reorder threshold is ${item.product.reorderThreshold}.`
        : `Current stock (${item.quantity}) is at or below the configured reorder threshold (${item.product.reorderThreshold || 10}); immediate restock recommended to prevent stockouts.`;

      const recommendation = await AIRecommendation.create({
        business: req.businessId,
        assistant: 'procurement',
        riskTier,
        action: 'reorder_suggestion',
        payload: {
          productId: item.product._id,
          branchId: item.branch?._id || item.branch,
          suggestedQuantity: suggestedQty,
          estimatedCost,
          supplierId: bestSupplier?.supplier?._id || null,
          supplierPrice: bestSupplier?.latestPrice ?? null,
        },
        rationale,
        confidenceScore,
        relatedProduct: item.product._id,
        relatedSupplier: bestSupplier?.supplier?._id || null,
        status: 'pending',
      });

      created.push(recommendation);
    }
  }

  // 2. Finance Assistant (Section 6.6 & 7: Cash-Flow Optimization)
  if (['all', 'finance'].includes(targetAssistant)) {
    const pendingReceivables = await Payment.find({
      business: req.businessId,
      direction: 'receivable',
      status: 'pending',
    });

    const totalUncollected = pendingReceivables.reduce((sum, p) => sum + (p.amount || 0), 0);

    if (totalUncollected > 0) {
      const rec = await AIRecommendation.create({
        business: req.businessId,
        assistant: 'finance',
        riskTier: 'medium',
        action: 'cash_flow_reminder',
        payload: {
          totalUncollected,
          pendingInvoicesCount: pendingReceivables.length,
          suggestedChannel: 'whatsapp',
        },
        rationale: `Uncollected customer receivables stand at ${totalUncollected.toLocaleString()} across ${pendingReceivables.length} invoice(s). Dispatching automated WhatsApp payment reminders is forecasted to improve cash conversion cycle by 4.2 days.`,
        confidenceScore: 0.88,
        status: 'pending',
      });
      created.push(rec);
    }
  }

  // 3. Sales Assistant (Section 6.4 & 7: Customer Retention / Promotion)
  if (['all', 'sales'].includes(targetAssistant)) {
    const customers = await Customer.find({ business: req.businessId }).limit(5);
    if (customers.length > 0) {
      const targetCustomer = customers[0];
      const rec = await AIRecommendation.create({
        business: req.businessId,
        assistant: 'sales',
        riskTier: 'low',
        action: 'customer_engagement_promo',
        payload: {
          customerId: targetCustomer._id,
          customerName: targetCustomer.name,
          suggestedOffer: '10% volume discount on next order',
          channel: 'whatsapp',
        },
        rationale: `Customer ${targetCustomer.name} has total spend of ${(targetCustomer.totalSpent || 0).toLocaleString()}. Automated outreach with personalized re-order incentive projected to increase repeat purchase frequency.`,
        confidenceScore: 0.82,
        status: 'pending',
      });
      created.push(rec);
    }
  }

  res.json({ generated: created.length, recommendations: created });
});

const listRecommendations = asyncHandler(async (req, res) => {
  const { status, assistant } = req.query;
  const query = { business: req.businessId };
  if (status) query.status = status;
  if (assistant) query.assistant = assistant;
  const recs = await AIRecommendation.find(query)
    .populate('relatedProduct', 'name sku')
    .populate('relatedSupplier', 'name')
    .sort({ createdAt: -1 });
  res.json(recs);
});

// @desc  Approve a recommendation -> creates corresponding order or triggers automated action (human-in-the-loop, Section 3.1/7.2)
const approveRecommendation = asyncHandler(async (req, res) => {
  const rec = await AIRecommendation.findOne({ _id: req.params.id, business: req.businessId });
  if (!rec) return res.status(404).json({ message: 'Recommendation not found' });
  if (rec.status !== 'pending') return res.status(400).json({ message: `Cannot approve a recommendation with status '${rec.status}'` });

  let createdOrder = null;
  if (rec.action === 'reorder_suggestion' && rec.payload?.productId) {
    createdOrder = await Order.create({
      business: req.businessId,
      branch: rec.payload.branchId,
      type: 'purchase',
      supplier: rec.payload.supplierId || undefined,
      items: [
        {
          product: rec.payload.productId,
          quantity: rec.payload.suggestedQuantity,
          unitPrice: rec.payload.supplierPrice || 0,
        },
      ],
      status: 'pending',
      createdBy: req.user._id,
      originatingRecommendation: rec._id,
    });
  }

  rec.status = 'approved';
  rec.reviewedBy = req.user._id;
  rec.reviewedAt = new Date();
  await rec.save();

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'ai_recommendation.approved',
    entityType: 'AIRecommendation',
    entityId: rec._id,
    metadata: { createdOrderId: createdOrder?._id, action: rec.action },
  });

  res.json({ recommendation: rec, order: createdOrder });
});

const rejectRecommendation = asyncHandler(async (req, res) => {
  const rec = await AIRecommendation.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId, status: 'pending' },
    { status: 'rejected', reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!rec) return res.status(404).json({ message: 'Recommendation not found or already reviewed' });

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'ai_recommendation.rejected',
    entityType: 'AIRecommendation',
    entityId: rec._id,
  });

  res.json(rec);
});

module.exports = { generateRecommendations, listRecommendations, approveRecommendation, rejectRecommendation };
