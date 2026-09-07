const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { logAction } = require('../utils/audit');

const listOrders = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const query = { business: req.businessId };
  if (type) query.type = type;
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('customer', 'name phone')
    .populate('supplier', 'name')
    .populate('branch', 'name')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  const total = await Order.countDocuments(query);
  res.json({ orders, total, page: Number(page), limit: Number(limit) });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, business: req.businessId })
    .populate('items.product', 'name sku')
    .populate('customer supplier branch');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

const createOrder = asyncHandler(async (req, res) => {
  const order = await Order.create({
    ...req.body,
    business: req.businessId,
    createdBy: req.user._id,
  });
  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: `order.${order.type}_created`,
    entityType: 'Order',
    entityId: order._id,
  });
  res.status(201).json(order);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOne({ _id: req.params.id, business: req.businessId });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const previousStatus = order.status;
  order.status = status;
  await order.save();

  // On fulfillment, apply stock movements automatically (sales = out, purchase = in)
  if (status === 'fulfilled' && previousStatus !== 'fulfilled') {
    for (const item of order.items) {
      let inv = await Inventory.findOne({ business: req.businessId, product: item.product, branch: order.branch });
      if (!inv) {
        inv = await Inventory.create({ business: req.businessId, product: item.product, branch: order.branch, quantity: 0 });
      }
      if (order.type === 'sales') {
        inv.quantity = Math.max(0, inv.quantity - item.quantity);
        inv.movementHistory.push({ type: 'out', quantity: item.quantity, reason: `Order ${order._id}` });
      } else {
        inv.quantity += item.quantity;
        inv.movementHistory.push({ type: 'in', quantity: item.quantity, reason: `Order ${order._id}` });
      }
      await inv.save();
    }
  }

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'order.status_changed',
    entityType: 'Order',
    entityId: order._id,
    metadata: { from: previousStatus, to: status },
  });

  res.json(order);
});

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus };
