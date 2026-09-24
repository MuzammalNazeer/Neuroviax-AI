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
  let customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!customer) {
    const existing = await Customer.findById(req.params.id);
    if (existing) {
      customer = await Customer.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
    }
  }

  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

const toggleWhatsAppOptIn = asyncHandler(async (req, res) => {
  let customer = await Customer.findOne({ _id: req.params.id, business: req.businessId });
  if (!customer) {
    customer = await Customer.findById(req.params.id);
  }

  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  if (req.body && typeof req.body.whatsappOptIn === 'boolean') {
    customer.whatsappOptIn = req.body.whatsappOptIn;
  } else {
    customer.whatsappOptIn = !customer.whatsappOptIn;
  }

  await customer.save();
  res.json({
    success: true,
    message: `WhatsApp Opt-In is now ${customer.whatsappOptIn ? 'Enabled' : 'Disabled'}`,
    customer,
  });
});

module.exports = { listCustomers, createCustomer, updateCustomer, toggleWhatsAppOptIn };
