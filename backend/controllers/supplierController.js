const asyncHandler = require('../utils/asyncHandler');
const Supplier = require('../models/Supplier');

const listSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ business: req.businessId }).sort({ createdAt: -1 });
  res.json(suppliers);
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create({ ...req.body, business: req.businessId });
  res.status(201).json(supplier);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  res.json(supplier);
});

// FR-06: compares suppliers by price, lead time, and historical reliability for a given product.
const compareSuppliers = asyncHandler(async (req, res) => {
  const { product } = req.query;
  if (!product) return res.status(400).json({ message: 'product query param is required' });

  const suppliers = await Supplier.find({ business: req.businessId, 'priceHistory.product': product });

  const comparison = suppliers.map((s) => {
    const relevant = s.priceHistory.filter((p) => p.product.toString() === product);
    const latestPrice = relevant.length ? relevant[relevant.length - 1].price : null;
    return {
      supplierId: s._id,
      name: s.name,
      latestPrice,
      leadTimeDays: s.leadTimeDays,
      reliabilityScore: s.reliabilityScore,
    };
  });

  comparison.sort((a, b) => (a.latestPrice ?? Infinity) - (b.latestPrice ?? Infinity));

  res.json(comparison);
});

module.exports = { listSuppliers, createSupplier, updateSupplier, compareSuppliers };
