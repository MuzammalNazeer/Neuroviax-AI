const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models (11 core + 5 extended modules)
const User = require('../models/User');
const Business = require('../models/Business');
const Branch = require('../models/Branch');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const AIRecommendation = require('../models/AIRecommendation');
const AuditLog = require('../models/AuditLog');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const Integration = require('../models/Integration');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');

const models = {
  User,
  Business,
  Branch,
  Product,
  Inventory,
  Supplier,
  Customer,
  Order,
  Payment,
  AIRecommendation,
  AuditLog,
  Expense,
  Notification,
  Report,
  Integration,
  SubscriptionPlan,
  Subscription,
};

const collections = {};
Object.keys(models).forEach((name) => {
  collections[name] = [];
});

function getNestedValue(obj, path) {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current == null) return undefined;
    if (Array.isArray(current)) {
      const restPath = parts.slice(i).join('.');
      return current.map((item) => getNestedValue(item, restPath)).flat();
    }
    current = current[parts[i]];
  }
  return current;
}

function matchesFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or') {
      if (!Array.isArray(val) || !val.some((subFilter) => matchesFilter(doc, subFilter))) {
        return false;
      }
      continue;
    }
    if (key === '$and') {
      if (!Array.isArray(val) || !val.every((subFilter) => matchesFilter(doc, subFilter))) {
        return false;
      }
      continue;
    }

    const docVal = getNestedValue(doc, key);

    if (val instanceof RegExp) {
      if (typeof docVal !== 'string' || !val.test(docVal)) return false;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof mongoose.Types.ObjectId)) {
      if (val.$in) {
        const inVals = val.$in.map((v) => (v != null ? v.toString() : v));
        const currentStr = docVal != null ? docVal.toString() : null;
        if (!inVals.includes(currentStr)) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        const neStr = val.$ne != null ? val.$ne.toString() : null;
        const currentStr = docVal != null ? docVal.toString() : null;
        if (currentStr === neStr) return false;
        continue;
      }
      if (val.$gt !== undefined && (docVal == null || docVal <= val.$gt)) return false;
      if (val.$gte !== undefined && (docVal == null || docVal < val.$gte)) return false;
      if (val.$lt !== undefined && (docVal == null || docVal >= val.$lt)) return false;
      if (val.$lte !== undefined && (docVal == null || docVal > val.$lte)) return false;
      continue;
    }

    if (Array.isArray(docVal)) {
      const targetStr = val != null ? val.toString() : null;
      const found = docVal.some((item) => {
        if (item == null) return false;
        return item.toString() === targetStr;
      });
      if (!found) return false;
      continue;
    }

    const docStr = docVal != null ? docVal.toString() : null;
    const filterStr = val != null ? val.toString() : null;
    if (docStr !== filterStr) return false;
  }

  return true;
}

function resolvePopulateTarget(modelName, field) {
  const map = {
    Payment: { order: 'Order' },
    Inventory: { product: 'Product', branch: 'Branch' },
    Order: { customer: 'Customer', supplier: 'Supplier', branch: 'Branch' },
    AIRecommendation: {
      relatedProduct: 'Product',
      relatedSupplier: 'Supplier',
      product: 'Product',
      supplier: 'Supplier',
    },
    User: { 'memberships.business': 'Business' },
  };
  return map[modelName]?.[field] || null;
}

function projectFields(doc, fields) {
  if (!fields || fields.length === 0) return doc;
  const res = { _id: doc._id };
  fields.forEach((f) => {
    if (doc[f] !== undefined) res[f] = doc[f];
  });
  return res;
}

function cloneDoc(doc, modelName) {
  if (!doc) return doc;
  const raw = doc.toObject ? doc.toObject({ getters: true, virtuals: true }) : { ...doc };
  const clone = new models[modelName](raw);
  if (doc.password) clone.password = doc.password;
  decorateDoc(clone, modelName);
  return clone;
}

function populateDoc(doc, populates, modelName) {
  if (!doc) return doc;
  if (!populates || populates.length === 0) return doc;

  const clone = cloneDoc(doc, modelName);

  for (const pop of populates) {
    const field = pop.path;
    const fieldsToSelect = pop.select ? pop.select.split(' ').filter(Boolean) : null;

    if (field === 'items.product') {
      if (Array.isArray(clone.items)) {
        clone.items.forEach((item) => {
          if (!item.product) return;
          const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
          const p = collections.Product.find((x) => x._id.toString() === prodId);
          if (p) {
            const proj = projectFields(p, fieldsToSelect);
            if (item._doc) item._doc.product = proj;
            Object.defineProperty(item, 'product', { value: proj, writable: true, configurable: true });
          }
        });
      }
      continue;
    }

    if (field === 'memberships.business') {
      if (Array.isArray(clone.memberships)) {
        clone.memberships.forEach((m) => {
          if (!m.business) return;
          const bId = m.business._id ? m.business._id.toString() : m.business.toString();
          const b = collections.Business.find((x) => x._id.toString() === bId);
          if (b) {
            const proj = projectFields(b, fieldsToSelect);
            if (m._doc) m._doc.business = proj;
            Object.defineProperty(m, 'business', { value: proj, writable: true, configurable: true });
          }
        });
      }
      continue;
    }

    const targetModel = resolvePopulateTarget(modelName, field);
    if (!targetModel || !collections[targetModel]) continue;

    const refVal = clone[field];
    if (!refVal) continue;

    const targetId = refVal._id ? refVal._id.toString() : refVal.toString();
    const targetDoc = collections[targetModel].find((x) => x._id.toString() === targetId);
    if (targetDoc) {
      const proj = projectFields(targetDoc, fieldsToSelect);
      if (clone._doc) {
        clone._doc[field] = proj;
      }
      Object.defineProperty(clone, field, { value: proj, writable: true, configurable: true });
    }
  }

  return clone;
}

class InMemoryQuery {
  constructor(modelName, filter, isFindOne = false) {
    this.modelName = modelName;
    this.filter = filter || {};
    this.isFindOne = isFindOne;
    this._populates = [];
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
    this._select = null;
  }

  populate(pathOrObj, select) {
    if (typeof pathOrObj === 'string') {
      const parts = pathOrObj.split(' ').filter(Boolean);
      if (parts.length > 1 && !select) {
        parts.forEach((p) => this._populates.push({ path: p, select: null }));
      } else {
        this._populates.push({ path: pathOrObj, select });
      }
    } else if (typeof pathOrObj === 'object' && pathOrObj.path) {
      this._populates.push(pathOrObj);
    }
    return this;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limit = Number(n) || 0;
    return this;
  }

  select(selectStr) {
    this._select = selectStr;
    return this;
  }

  async _exec() {
    let list = collections[this.modelName].filter((doc) => matchesFilter(doc, this.filter));

    if (this._sort) {
      const entries = Object.entries(this._sort);
      list.sort((a, b) => {
        for (const [key, dir] of entries) {
          const valA = getNestedValue(a, key);
          const valB = getNestedValue(b, key);
          if (valA < valB) return dir === -1 || dir === 'desc' ? 1 : -1;
          if (valA > valB) return dir === -1 || dir === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    if (this.isFindOne) {
      const doc = list[0] || null;
      if (!doc) return null;
      return populateDoc(doc, this._populates, this.modelName);
    }

    if (this._skip > 0) {
      list = list.slice(this._skip);
    }
    if (this._limit > 0) {
      list = list.slice(0, this._limit);
    }

    return list.map((doc) => populateDoc(doc, this._populates, this.modelName));
  }

  then(resolve, reject) {
    return this._exec().then(resolve, reject);
  }

  catch(reject) {
    return this._exec().catch(reject);
  }
}

function decorateDoc(doc, modelName) {
  if (!doc) return doc;

  doc.save = async function () {
    this.updatedAt = new Date();
    const idx = collections[modelName].findIndex((d) => d._id.toString() === this._id.toString());
    if (idx >= 0) {
      collections[modelName][idx] = this;
    } else {
      collections[modelName].push(this);
    }
    saveStore();
    return this;
  };

  return doc;
}

const fs = require('fs');
const path = require('path');
const STORE_PATH = path.join(__dirname, '../.in_memory_store.json');

function saveStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(collections, null, 2), 'utf8');
  } catch (err) {
    // silent
  }
}

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      for (const [name, items] of Object.entries(data)) {
        if (collections[name] && Array.isArray(items)) {
          collections[name] = items.map((item) => {
            const doc = new models[name](item);
            if (item.password) doc.password = item.password;
            decorateDoc(doc, name);
            return doc;
          });
        }
      }
      return collections.User && collections.User.length > 0;
    }
  } catch (err) {
    console.warn('[InMemoryDB] Could not restore store:', err.message);
  }
  return false;
}

function patchModel(modelName, ModelClass) {
  ModelClass.find = function (filter) {
    return new InMemoryQuery(modelName, filter, false);
  };

  ModelClass.findOne = function (filter) {
    return new InMemoryQuery(modelName, filter, true);
  };

  ModelClass.findById = function (id) {
    return new InMemoryQuery(modelName, { _id: id }, true);
  };

  ModelClass.countDocuments = async function (filter) {
    return collections[modelName].filter((doc) => matchesFilter(doc, filter)).length;
  };

  ModelClass.deleteMany = async function (filter) {
    const before = collections[modelName].length;
    collections[modelName] = collections[modelName].filter((doc) => !matchesFilter(doc, filter));
    saveStore();
    return { deletedCount: before - collections[modelName].length };
  };

  ModelClass.create = async function (dataOrArray) {
    const isArray = Array.isArray(dataOrArray);
    const items = isArray ? dataOrArray : [dataOrArray];
    const created = [];

    for (const item of items) {
      const doc = new ModelClass(item);
      if (modelName === 'User' && item.password) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(item.password, salt);
      }
      doc.createdAt = doc.createdAt || new Date();
      doc.updatedAt = doc.updatedAt || new Date();
      decorateDoc(doc, modelName);
      collections[modelName].push(doc);
      created.push(doc);
    }

    saveStore();
    return isArray ? created : created[0];
  };

  ModelClass.insertMany = async function (array) {
    return ModelClass.create(array);
  };

  ModelClass.findOneAndUpdate = async function (filter, update, options = {}) {
    let doc = collections[modelName].find((d) => matchesFilter(d, filter));

    if (!doc && options.upsert) {
      const created = await ModelClass.create({ ...filter, ...update });
      saveStore();
      return created;
    }
    if (!doc) return null;

    if (update.$set) {
      Object.assign(doc, update.$set);
    }
    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        doc[k] = (Number(doc[k]) || 0) + Number(v);
      }
    }
    if (update.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        if (!Array.isArray(doc[k])) doc[k] = [];
        doc[k].push(v);
      }
    }

    for (const [k, v] of Object.entries(update)) {
      if (!k.startsWith('$')) {
        doc[k] = v;
      }
    }

    doc.updatedAt = new Date();
    saveStore();
    return doc;
  };

  ModelClass.findByIdAndUpdate = async function (id, update, options = {}) {
    return ModelClass.findOneAndUpdate({ _id: id }, update, options);
  };
}

// Fixed IDs so JWT tokens survive server restarts (no "user not found" on reload)
const DEMO_USER_ID = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');
const DEMO_BUSINESS_ID = new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb');
const DEMO_BRANCH_ID = new mongoose.Types.ObjectId('cccccccccccccccccccccccc');

async function seedDemoData() {
  console.log('[InMemoryDB] Seeding demo store data...');

  const user = await models.User.create({
    _id: DEMO_USER_ID,
    name: 'Demo Owner',
    email: 'demo@neuroviax.ai',
    password: 'Password123!',
    memberships: [],
  });

  const business = await models.Business.create({
    _id: DEMO_BUSINESS_ID,
    name: 'Demo Retail Store',
    industry: 'retail',
    owner: user._id,
    subscriptionPlan: 'growth',
  });

  user.memberships.push({ business: business._id, role: 'owner' });
  await user.save();

  // Seed Super Admin: Muzammal Nazeer (Strict exclusive platform owner)
  const SUPER_ADMIN_ID = new mongoose.Types.ObjectId('111111111111111111111111');
  const superAdmin = await models.User.create({
    _id: SUPER_ADMIN_ID,
    name: 'Muzammal Nazeer',
    email: 'nazeermuzammal174@gmail.com',
    password: 'Password123!',
    isSuperAdmin: true,
    isActive: true,
    lastLoginAt: new Date(),
    memberships: [{ business: business._id, role: 'owner' }],
  });

  // Seed sample platform users so Super Admin has rich signups to inspect immediately
  const sampleUser1 = await models.User.create({
    name: 'Hamza Tariq',
    email: 'hamza.tariq@lahoretrade.pk',
    password: 'Password123!',
    isSuperAdmin: false,
    isActive: true,
    currentPlan: 'BASIC',
    lastLoginAt: new Date(Date.now() - 2 * 3600000),
    memberships: [{ business: business._id, role: 'admin' }],
  });

  const sampleUser2 = await models.User.create({
    name: 'Fatima Noor',
    email: 'fatima@crescentfabrics.com',
    password: 'Password123!',
    isSuperAdmin: false,
    isActive: true,
    currentPlan: 'PRO',
    lastLoginAt: new Date(Date.now() - 24 * 3600000),
    memberships: [{ business: business._id, role: 'manager' }],
  });

  const branch = await models.Branch.create({
    _id: DEMO_BRANCH_ID,
    business: business._id,
    name: 'Main Branch',
    type: 'both',
    address: { city: 'Lahore', country: 'Pakistan' },
  });

  const supplier = await models.Supplier.create({
    business: business._id,
    name: 'Alpha Distributors',
    leadTimeDays: 5,
    reliabilityScore: 82,
    priceHistory: [],
  });

  const product = await models.Product.create({
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

  await models.Inventory.create({
    business: business._id,
    product: product._id,
    branch: branch._id,
    quantity: 10,
    movementHistory: [
      { type: 'in', quantity: 50, reason: 'Initial stock', date: new Date(Date.now() - 20 * 86400000) },
      { type: 'out', quantity: 40, reason: 'Sales', date: new Date(Date.now() - 5 * 86400000) },
    ],
  });

  // Seed sample expenses (Section 6.6 & 10)
  await models.Expense.create({
    business: business._id,
    branch: branch._id,
    title: 'Store Warehouse Monthly Lease',
    category: 'rent',
    amount: 45000,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    notes: 'Commercial lease for Lahore main branch facility',
    createdBy: user._id,
  });

  await models.Expense.create({
    business: business._id,
    branch: branch._id,
    title: 'Commercial Electricity & Utilities',
    category: 'utilities',
    amount: 14200,
    status: 'paid',
    paymentMethod: 'easypaisa',
    notes: 'LESCO billing receipt #881923',
    createdBy: user._id,
  });

  await models.Expense.create({
    business: business._id,
    branch: branch._id,
    title: 'Supplier Freight Logistics',
    category: 'inventory_shipping',
    amount: 6800,
    status: 'paid',
    paymentMethod: 'cash',
    notes: 'Inter-city dispatch from Alpha Distributors',
    createdBy: user._id,
  });

  // Seed sample multi-channel notifications (Section 10 & 11 FR-07)
  await models.Notification.create({
    business: business._id,
    user: user._id,
    title: 'AI Restock Recommendation Active',
    message: 'Procurement Assistant generated a restock proposal for Basmati Rice 5kg (10 units remaining).',
    type: 'ai_recommendation',
    channel: 'in_app',
    status: 'unread',
  });

  await models.Notification.create({
    business: business._id,
    user: user._id,
    title: 'WhatsApp Order Dispatch Automated',
    message: 'Customer order confirmation dispatched via WhatsApp Business API successfully.',
    type: 'order',
    channel: 'whatsapp',
    status: 'unread',
  });

  await models.Notification.create({
    business: business._id,
    user: user._id,
    title: 'System Security Verification Complete',
    message: 'Audit logging and role-based access control verified against Section 12 requirements.',
    type: 'system',
    channel: 'in_app',
    status: 'read',
  });

  // Seed default integrations (Section 8 & 10)
  await models.Integration.create({
    business: business._id,
    provider: 'whatsapp',
    isEnabled: true,
    status: 'connected',
    environment: 'production',
    config: {
      phoneId: '+92 326 4414694',
      webhookUrl: 'https://api.neuroviax.ai/webhook/whatsapp',
      apiKeyMasked: '••••••••••••••••3821',
      lastSyncedAt: new Date(),
    },
  });

  await models.Integration.create({
    business: business._id,
    provider: 'jazzcash',
    isEnabled: true,
    status: 'connected',
    environment: 'sandbox',
    config: {
      merchantId: 'JC-994012',
      apiKeyMasked: '••••••••••••••••8912',
      lastSyncedAt: new Date(),
    },
  });

  await models.Integration.create({
    business: business._id,
    provider: 'easypaisa',
    isEnabled: true,
    status: 'connected',
    environment: 'sandbox',
    config: {
      merchantId: 'EP-440219',
      apiKeyMasked: '••••••••••••••••1092',
      lastSyncedAt: new Date(),
    },
  });

  await models.Integration.create({
    business: business._id,
    provider: 'stripe',
    isEnabled: false,
    status: 'disconnected',
    environment: 'sandbox',
    config: {
      apiKeyMasked: '••••••••••••••••0000',
    },
  });

  await models.Integration.create({
    business: business._id,
    provider: 'razorpay',
    isEnabled: false,
    status: 'disconnected',
    environment: 'sandbox',
    config: {
      apiKeyMasked: '••••••••••••••••0000',
    },
  });

  console.log('[InMemoryDB] Demo data seeded successfully.');
  console.log(`[InMemoryDB] Demo Account: demo@neuroviax.ai / Password123!`);
  console.log(`[InMemoryDB] Business ID: ${business._id}`);
}

let isEnabled = false;

async function enableInMemoryDb() {
  if (isEnabled) return;
  isEnabled = true;

  console.log('[InMemoryDB] Activating in-memory database adapters...');
  for (const [name, modelClass] of Object.entries(models)) {
    patchModel(name, modelClass);
  }

  const restored = loadStore();
  if (restored) {
    console.log('[InMemoryDB] Restored persisted store with existing data.');
  } else {
    await seedDemoData();
    saveStore();
  }
  console.log('[InMemoryDB] Ready to serve requests.');
}

module.exports = {
  enableInMemoryDb,
  collections,
  models,
};
