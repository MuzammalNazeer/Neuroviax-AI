const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const { logAction } = require('../utils/audit');

const listProducts = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { business: req.businessId };
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { sku: new RegExp(search, 'i') },
      { barcode: new RegExp(search, 'i') },
    ];
  }
  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  const total = await Product.countDocuments(query);
  res.json({ products, total, page: Number(page), limit: Number(limit) });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, business: req.businessId });
  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'product.created',
    entityType: 'Product',
    entityId: product._id,
  });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'product.updated',
    entityType: 'Product',
    entityId: product._id,
  });
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    { isActive: false },
    { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'product.deactivated',
    entityType: 'Product',
    entityId: product._id,
  });
  res.json({ message: 'Product deactivated' });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
