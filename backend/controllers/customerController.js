const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer');

const listCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ business: req.businessId }).sort({ createdAt: -1 });
  res.json(customers);
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, business: req.businessId });
  res.status(201).json(customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

module.exports = { listCustomers, createCustomer, updateCustomer };
