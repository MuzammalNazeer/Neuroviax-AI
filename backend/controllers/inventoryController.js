const asyncHandler = require('../utils/asyncHandler');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { logAction } = require('../utils/audit');

const listInventory = asyncHandler(async (req, res) => {
  const { branch, product } = req.query;
  const query = { business: req.businessId };
  if (branch) query.branch = branch;
  if (product) query.product = product;
  const items = await Inventory.find(query).populate('product', 'name sku reorderThreshold').populate('branch', 'name');
  res.json(items);
});

// FR-02: barcode/QR-based stock receiving, picking, cycle counts.
// This single endpoint handles all three via a `type` field.
const recordMovement = asyncHandler(async (req, res) => {
  const { product, branch, type, quantity, reason, batchNumber } = req.body;

  if (!product || !branch || !type || !quantity) {
    return res.status(400).json({ message: 'product, branch, type, and quantity are required' });
  }

  let inventory = await Inventory.findOne({ business: req.businessId, product, branch });

  if (!inventory) {
    inventory = await Inventory.create({ business: req.businessId, product, branch, quantity: 0, batchNumber });
  }

  if (type === 'in' || type === 'adjustment_add') {
    inventory.quantity += Number(quantity);
  } else if (type === 'out' || type === 'adjustment_remove') {
    if (inventory.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock for this movement' });
    }
    inventory.quantity -= Number(quantity);
  } else {
    return res.status(400).json({ message: 'Invalid movement type' });
  }

  inventory.movementHistory.push({
    type: type.startsWith('in') || type === 'adjustment_add' ? 'in' : type.startsWith('out') || type === 'adjustment_remove' ? 'out' : 'adjustment',
    quantity,
    reason,
  });

  await inventory.save();

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'inventory.movement_recorded',
    entityType: 'Inventory',
    entityId: inventory._id,
    metadata: { type, quantity, reason },
  });

  res.json(inventory);
});

// FR-04: low-stock alerts. Static-threshold version; the AI controller layers forecast-adjusted alerts on top.
const lowStockAlerts = asyncHandler(async (req, res) => {
  const inventoryItems = await Inventory.find({ business: req.businessId }).populate('product', 'name sku reorderThreshold');
  const alerts = inventoryItems.filter(
    (i) => i.product && i.quantity <= i.product.reorderThreshold
  );
  res.json(alerts);
});

module.exports = { listInventory, recordMovement, lowStockAlerts };
