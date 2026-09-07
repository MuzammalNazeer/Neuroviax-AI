require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Business = require('../models/Business');
const Branch = require('../models/Branch');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

const run = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({ email: 'demo@neuroviax.ai' }),
  ]);

  console.log('Creating demo owner + business...');
  const user = await User.create({
    name: 'Demo Owner',
    email: 'demo@neuroviax.ai',
    password: 'Password123!',
  });

  const business = await Business.create({
    name: 'Demo Retail Store',
    industry: 'retail',
    owner: user._id,
  });

  user.memberships.push({ business: business._id, role: 'owner' });
  await user.save();

  const branch = await Branch.create({
    business: business._id,
    name: 'Main Branch',
    type: 'both',
    address: { city: 'Lahore', country: 'Pakistan' },
  });

  const supplier = await Supplier.create({
    business: business._id,
    name: 'Alpha Distributors',
    leadTimeDays: 5,
    reliabilityScore: 82,
  });

  const product = await Product.create({
    business: business._id,
    name: 'Basmati Rice 5kg',
    sku: 'RICE-5KG',
    unit: 'bag',
    costPrice: 800,
    sellPrice: 1100,
    reorderThreshold: 15,
  });

  supplier.priceHistory.push({ product: product._id, price: 780 });
  await supplier.save();

  await Inventory.create({
    business: business._id,
    product: product._id,
    branch: branch._id,
    quantity: 10, // below reorderThreshold, will trigger a recommendation
    movementHistory: [
      { type: 'in', quantity: 50, reason: 'Initial stock', date: new Date(Date.now() - 20 * 86400000) },
      { type: 'out', quantity: 40, reason: 'Sales', date: new Date(Date.now() - 5 * 86400000) },
    ],
  });

  console.log('Seed complete.');
  console.log('Login with: demo@neuroviax.ai / Password123!');
  console.log('Business ID:', business._id.toString());

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
