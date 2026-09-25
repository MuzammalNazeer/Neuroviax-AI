const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const AIRecommendation = require('../models/AIRecommendation');
const Supplier = require('../models/Supplier');

/**
 * Intelligent Language Detector (Urdu / Hindi / Roman Urdu vs English)
 */
function isRomanUrduOrHindi(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const urduWords = [
    'kya', 'hai', 'hain', 'kitna', 'kitne', 'kitni', 'kaise', 'karein', 'karo', 'mujhe',
    'batao', 'faida', 'sale', 'kamai', 'paisa', 'bacha', 'kharch', 'maal', 'grahak',
    'chahiye', 'hoga', 'hota', 'shukriya', 'theek', 'acha', 'kar do', 'dak lo', 'apna',
    'nahi', 'nii', 'konsa', 'wala', 'meri', 'mera', 'humara', 'ye', 'yeh', 'wo', 'woh',
    'urdu', 'hindi', 'bataiye', 'zaroorat', 'jaldi'
  ];
  return urduWords.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower));
}

/**
 * @desc  Fetch live copilot quick stats for interactive pills
 * @route GET /api/ai/copilot/stats
 */
const getCopilotQuickStats = asyncHandler(async (req, res) => {
  const businessId = req.businessId;

  if (!businessId) {
    return res.json({
      isLoggedIn: false,
      lowStockCount: 3,
      whatsappOptIns: 12,
      pendingOrders: 2,
      activeAnomalies: 1,
      totalRevenue: 24500,
      businessName: 'Neuroviax Demo Store',
    });
  }

  // Live queries from Mongoose / InMemoryDb
  const [inventories, orders, customers, recommendations] = await Promise.all([
    Inventory.find({ business: businessId }).populate('product'),
    Order.find({ business: businessId }),
    Customer.find({ business: businessId }),
    AIRecommendation.find({ business: businessId, status: 'pending' }),
  ]);

  const lowStockItems = inventories.filter((inv) => {
    const threshold = inv.product?.reorderThreshold || 10;
    return inv.quantity <= threshold;
  });

  const whatsappOptIns = customers.filter((c) => c.whatsappOptIn === true).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const totalRevenue = orders.reduce((sum, o) => {
    return sum + (Number(o.totalAmount) || 0);
  }, 0);

  res.json({
    isLoggedIn: true,
    lowStockCount: lowStockItems.length,
    whatsappOptIns,
    pendingOrders,
    activeAnomalies: recommendations.filter((r) => r.riskTier === 'high').length,
    totalRevenue,
    totalProducts: inventories.length,
    totalCustomers: customers.length,
  });
});

/**
 * @desc  AI Copilot Chat Engine with Real-Time Store Intelligence & Dual Language
 * @route POST /api/ai/copilot/chat
 */
const copilotChat = asyncHandler(async (req, res) => {
  const { message = '', persona = 'abop', contextPath = '/' } = req.body;
  const businessId = req.businessId;
  const rawMsg = message.trim();
  const lowerMsg = rawMsg.toLowerCase();
  const isUrdu = isRomanUrduOrHindi(rawMsg);

  // Default context datasets
  let inventories = [];
  let orders = [];
  let customers = [];
  let recommendations = [];
  let suppliers = [];

  if (businessId) {
    [inventories, orders, customers, recommendations, suppliers] = await Promise.all([
      Inventory.find({ business: businessId }).populate('product'),
      Order.find({ business: businessId }),
      Customer.find({ business: businessId }),
      AIRecommendation.find({ business: businessId }),
      Supplier.find({ business: businessId }),
    ]);
  }

  const lowStockItems = inventories.filter((inv) => {
    const threshold = inv.product?.reorderThreshold || 10;
    return inv.quantity <= threshold;
  });

  const whatsappCustomers = customers.filter((c) => c.whatsappOptIn === true);
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const highRiskRecs = recommendations.filter((r) => r.riskTier === 'high' && r.status === 'pending');

  let reply = '';
  let actions = [];
  let snapshot = null;

  // 1. LOW STOCK / INVENTORY INTENT
  if (
    lowerMsg.includes('stock') ||
    lowerMsg.includes('inventory') ||
    lowerMsg.includes('maal') ||
    lowerMsg.includes('reorder') ||
    lowerMsg.includes('bacha') ||
    lowerMsg.includes('exhaust')
  ) {
    if (businessId) {
      if (lowStockItems.length > 0) {
        const itemNames = lowStockItems
          .slice(0, 4)
          .map((i) => `• **${i.product?.name || 'Unknown SKU'}**: ${i.quantity} bache hain (Threshold: ${i.product?.reorderThreshold || 10})`)
          .join('\n');

        if (isUrdu) {
          reply = `🚨 **Stock Alert (${lowStockItems.length} Products Low Stock Par Hain!):**\n\n${itemNames}\n\nAgay stockout se bachne ke liye Procurement AI se auto-purchase order create karein ya Inventory check karein:`;
        } else {
          reply = `🚨 **Inventory Alert: ${lowStockItems.length} Items Running Low on Stock!**\n\n${itemNames}\n\nTo prevent stockouts and revenue disruption, review inventory or trigger an autonomous restock PO:`;
        }

        actions = [
          { label: '📦 View Inventory Items', path: '/inventory', variant: 'primary' },
          { label: '🤖 Generate Restock PO', path: '/ai-assistants', variant: 'secondary' },
        ];
        snapshot = { lowStockCount: lowStockItems.length };
      } else {
        if (isUrdu) {
          reply = `✅ **Inventory Bilkul Healthy Hai!**\nAapke sabhi products ka stock safe threshold se ooper hai. Koi critical shortage detect nahi hui.`;
        } else {
          reply = `✅ **Inventory Health is Optimal!**\nAll active SKUs have sufficient buffer stock above reorder thresholds. No critical stockouts projected in the next 14 days.`;
        }
        actions = [{ label: '📦 Open Inventory', path: '/inventory' }];
      }
    } else {
      reply = isUrdu
        ? `📦 **Neuroviax Inventory Intelligence:**\nNeuroviax AI aapke stock levels ko real-time monitor karta hai aur ML Demand Forecasting (XGBoost) se stockout hone se 14 din pehle alert deta hai.`
        : `📦 **Neuroviax Smart Inventory Management:**\nOur system predicts stock exhaustion up to 14 days in advance using machine-learning demand forecasting and automatically prepares restock purchase orders.`;
      actions = [
        { label: '🚀 Explore ABOP Loop', path: '/abop-loop' },
        { label: '💎 View Pricing Plans', path: '/pricing' },
      ];
    }
  }

  // 2. SALES, REVENUE, PROFIT & CASH FLOW INTENT
  else if (
    lowerMsg.includes('sale') ||
    lowerMsg.includes('revenue') ||
    lowerMsg.includes('kamai') ||
    lowerMsg.includes('paisa') ||
    lowerMsg.includes('earning') ||
    lowerMsg.includes('profit') ||
    lowerMsg.includes('cash') ||
    lowerMsg.includes('order')
  ) {
    if (businessId) {
      const avgOrder = orders.length ? (totalRevenue / orders.length).toFixed(2) : 0;
      if (isUrdu) {
        reply = `💰 **Business Financial Snapshot:**\n\n• **Total Revenue:** $${totalRevenue.toLocaleString()}\n• **Total Orders:** ${orders.length} (Pending: ${pendingOrders.length})\n• **Average Order Value (AOV):** $${avgOrder}\n\nFinance AI aapke cash flow ko 14 dino tak predict karta hai taake operating expenses secure rahein.`;
      } else {
        reply = `💰 **Real-Time Financial & Sales Summary:**\n\n• **Gross Revenue:** $${totalRevenue.toLocaleString()}\n• **Total Orders Processed:** ${orders.length} (${pendingOrders.length} pending fulfillment)\n• **Average Order Value:** $${avgOrder}\n\nFinance AI continuously tracks 14-day cash-flow predictions to guard against liquidity deficits.`;
      }
      actions = [
        { label: '📊 View Sales Orders', path: '/orders', variant: 'primary' },
        { label: '📈 Cash Flow Prediction', path: '/cash-flow-prediction', variant: 'secondary' },
        { label: '💵 Payments Ledger', path: '/payments' },
      ];
      snapshot = { totalRevenue, totalOrders: orders.length, pendingOrders: pendingOrders.length };
    } else {
      reply = isUrdu
        ? `📈 **Autonomous Financial Management:**\nNeuroviax AI aapki sales, revenue, Stripe payments aur cash-flow ko automatically track aur forecast karta hai taake business hamesha profitable rahe.`
        : `📈 **Autonomous Revenue & Cash Flow Forecasting:**\nNeuroviax AI tracks sales, Stripe subscriptions, receivables, and payables with built-in predictive analytics.`;
      actions = [{ label: '💎 See Plans & Pricing', path: '/pricing' }];
    }
  }

  // 3. WHATSAPP OPT-IN & CRM INTENT
  else if (
    lowerMsg.includes('whatsapp') ||
    lowerMsg.includes('opt-in') ||
    lowerMsg.includes('optin') ||
    lowerMsg.includes('campaign') ||
    lowerMsg.includes('grahak') ||
    lowerMsg.includes('customer') ||
    lowerMsg.includes('crm')
  ) {
    if (businessId) {
      const pct = customers.length ? Math.round((whatsappCustomers.length / customers.length) * 100) : 0;
      if (isUrdu) {
        reply = `📱 **WhatsApp Marketing & Customer Status:**\n\n• **Total Registered Customers:** ${customers.length}\n• **WhatsApp Opt-In Verified:** ${whatsappCustomers.length} (${pct}% audience)\n\nAap directly customer table se WhatsApp toggle on/off kar sakte hain aur one-click se WhatsApp message launch kar sakte hain!`;
      } else {
        reply = `📱 **WhatsApp CRM & Marketing Engagement:**\n\n• **Total Customer Base:** ${customers.length}\n• **WhatsApp Opt-In Verified:** ${whatsappCustomers.length} customers (${pct}% reachable)\n\nYou can toggle WhatsApp consent per customer and launch direct chat campaigns directly from the Customers portal!`;
      }
      actions = [
        { label: '👥 Manage WhatsApp Customers', path: '/customers', variant: 'primary' },
        { label: '🎯 Customer Segmentation', path: '/customer-segmentation', variant: 'secondary' },
      ];
      snapshot = { totalCustomers: customers.length, whatsappOptIns: whatsappCustomers.length };
    } else {
      reply = isUrdu
        ? `📱 **Direct WhatsApp Automation:**\nNeuroviax customers ko direct WhatsApp updates, order tracking alerts, aur abandoned cart recovery bhejne ki facility deta hai with full GDPR/opt-in compliance.`
        : `📱 **Direct WhatsApp Business Automation:**\nNeuroviax automates order alerts, cart recovery, and targeted promotional broadcasts directly over WhatsApp with compliant opt-in management.`;
      actions = [{ label: '🚀 Explore Features', path: '/assistants' }];
    }
  }

  // 4. ANOMALIES & FRAUD RISK INTENT
  else if (
    lowerMsg.includes('anomaly') ||
    lowerMsg.includes('fraud') ||
    lowerMsg.includes('risk') ||
    lowerMsg.includes('khatra') ||
    lowerMsg.includes('suspicious') ||
    lowerMsg.includes('galat')
  ) {
    if (businessId) {
      if (isUrdu) {
        reply = `🛡️ **Risk & Anomaly Intelligence (Isolation Forest):**\n\nSystem inventory shrinkage, price irregularities, aur uncharacteristic order spikes ko monitor karta hai.\n• **High-Risk Flags:** ${highRiskRecs.length} items flagged\n\nKisi bhi unauthorized transaction ya loss se bachne ke liye anomaly logs check karein:`;
      } else {
        reply = `🛡️ **Anomaly & Fraud Detection (Isolation Forest):**\n\nNeuroviax continuously scores transactions and inventory variances to eliminate fraud and leakage.\n• **High-Risk Items:** ${highRiskRecs.length} require review\n\nInspect suspicious spikes or stock discrepancies in the anomaly suite:`;
      }
      actions = [
        { label: '🛡️ Open Anomaly Detection', path: '/anomaly-detection', variant: 'primary' },
        { label: '📋 View Audit Trail', path: '/reports', variant: 'secondary' },
      ];
    } else {
      reply = isUrdu
        ? `🛡️ **Isolation Forest Anomaly Guard:**\nNeuroviax AI har purchase aur order ko evaluate karta hai taake koi fake invoice ya fraud na ho sake.`
        : `🛡️ **Isolation Forest Anomaly Guard:**\nEvery sales transaction, batch movement, and price override is screened against historical norms to prevent leakage.`;
      actions = [{ label: '🚀 See Differentiators', path: '/differentiator' }];
    }
  }

  // 5. PRICING & SUBSCRIPTION INTENT
  else if (
    lowerMsg.includes('price') ||
    lowerMsg.includes('pricing') ||
    lowerMsg.includes('plan') ||
    lowerMsg.includes('package') ||
    lowerMsg.includes('subscription') ||
    lowerMsg.includes('stripe') ||
    lowerMsg.includes('kitne ka') ||
    lowerMsg.includes('rate') ||
    lowerMsg.includes('discount')
  ) {
    if (isUrdu) {
      reply = `💎 **Neuroviax AI Subscription Packages:**\n\n1. **Starter Plan ($29/month)**: Core ERP, inventory, billing, 100 products, standard AI alerts.\n2. **Professional Plan ($79/month)** ⭐ Popular: Unlimited products, 6 AI autonomous assistants, WhatsApp CRM, demand forecasting.\n3. **Enterprise Plan ($199/month)**: Multi-branch, custom ML models, dedicated SLA support, Stripe + Firestore instant sync.\n\nStripe checkout se instant activation milti hai:`;
    } else {
      reply = `💎 **Neuroviax AI Tiered Subscription Plans:**\n\n1. **Starter ($29/mo)**: Single branch, essential ERP, inventory tracking, standard analytics.\n2. **Professional ($79/mo)** [Recommended]: Full 6 AI Assistants, XGBoost demand forecasting, WhatsApp CRM automation, unlimited SKUs.\n3. **Enterprise ($199/mo)**: Multi-branch sync, custom ML thresholds, priority 24/7 SLA, and Firebase Firestore 2-tier sync.\n\nAll subscriptions include Stripe automated billing & immediate feature unlocking:`;
    }
    actions = [
      { label: '💳 View Pricing & Upgrade', path: '/pricing', variant: 'primary' },
      { label: '⚙️ Manage Active Subscription', path: '/subscription', variant: 'secondary' },
    ];
  }

  // 6. INDUSTRY FIT & STORE ADVISORY (Grocery, Pharmacy, Retail, Wholesale, Fashion)
  else if (
    lowerMsg.includes('grocery') ||
    lowerMsg.includes('pharmacy') ||
    lowerMsg.includes('medical') ||
    lowerMsg.includes('store') ||
    lowerMsg.includes('shop') ||
    lowerMsg.includes('dukan') ||
    lowerMsg.includes('mart') ||
    lowerMsg.includes('retail') ||
    lowerMsg.includes('wholesale') ||
    lowerMsg.includes('clothing') ||
    lowerMsg.includes('brand') ||
    lowerMsg.includes('restaurant')
  ) {
    if (isUrdu) {
      reply = `🏪 **Aapke Business Ke Liye Neuroviax AI Solution:**\n\n• **Retail & Grocery Marts:** Barcode POS, expiry tracking, fast billing, aur automated low-stock alerts.\n• **Pharmacies:** Batch numbers, supplier purchase orders, aur isolation forest anomaly check.\n• **Wholesale & Distribution:** Multi-branch warehouse sync, bulk customer ledgers, aur auto-invoicing.\n\n⭐ **Recommended Package:** **Professional Plan ($79/mo)** — isme demand forecasting aur WhatsApp automated customer alerts shamil hain!`;
    } else {
      reply = `🏪 **Tailored Solution for Your Business Model:**\n\n• **Retail & Grocery Marts:** High-speed barcode POS, live stock depletion alerts, and automated reorder purchase orders.\n• **Pharmacies & Medical Stores:** Batch/expiry management, supplier replenishment triggers, and anomaly audits.\n• **Wholesale & Distribution:** Multi-warehouse inventory sync, customer credit management, and WhatsApp invoice dispatch.\n\n⭐ **Recommended Tier:** **Professional Plan ($79/mo)** — unlocks XGBoost demand forecasting and 24/7 autonomous CRM alerts!`;
    }
    actions = [
      { label: '💎 View Professional Plan', path: '/pricing', variant: 'primary' },
      { label: '📦 Explore Inventory AI', path: '/inventory', variant: 'secondary' },
      { label: '📱 WhatsApp Support', path: '/contact' },
    ];
  }

  // 7. DEMO / TRIAL / CONSULTATION REQUEST
  else if (
    lowerMsg.includes('demo') ||
    lowerMsg.includes('trial') ||
    lowerMsg.includes('rabta') ||
    lowerMsg.includes('contact') ||
    lowerMsg.includes('call') ||
    lowerMsg.includes('phone') ||
    lowerMsg.includes('meeting') ||
    lowerMsg.includes('talk') ||
    lowerMsg.includes('support')
  ) {
    if (isUrdu) {
      reply = `📞 **Instant Demo & Consultation Setup:**\n\nAap foran Neuroviax AI team se WhatsApp ya contact form ke zariye rabta kar sakte hain:\n\n• 📲 **Direct WhatsApp:** 03264414694 (24/7 Available)\n• 📧 **Live Ticket:** Dedicated enterprise SLA\n• 💻 **Interactive Tour:** Aap public demo sandbox mein 6 AI Assistants aur ABOP loop ko foran test kar sakte hain!`;
    } else {
      reply = `📞 **Schedule a Demo or Speak with an AI Architect:**\n\nExperience Neuroviax AI in action with a guided onboarding session:\n\n• 📲 **Direct WhatsApp Hotline:** +92 326 4414694 (Instant response)\n• 🎯 **Live Interactive Sandbox:** Test all 6 autonomous assistants in real-time\n• 🎫 **Priority Help Desk:** Fast ticket resolution on our Contact portal`;
    }
    actions = [
      { label: '📞 Open Contact Page', path: '/contact', variant: 'primary' },
      { label: '🤖 Test 6 AI Assistants', path: '/assistants', variant: 'secondary' },
      { label: '🔄 View ABOP Loop', path: '/abop-loop' },
    ];
  }

  // 8. COMPETITIVE ADVANTAGE / DIFFERENTIATOR (vs SAP, Zoho, Odoo, Tally)
  else if (
    lowerMsg.includes('odoo') ||
    lowerMsg.includes('sap') ||
    lowerMsg.includes('zoho') ||
    lowerMsg.includes('tally') ||
    lowerMsg.includes('muqabla') ||
    lowerMsg.includes('compare') ||
    lowerMsg.includes('difference') ||
    lowerMsg.includes('differentiator') ||
    lowerMsg.includes('kyun') ||
    lowerMsg.includes('why')
  ) {
    if (isUrdu) {
      reply = `⚔️ **Neuroviax AI vs Traditional ERPs (Odoo, SAP, Zoho, Tally):**\n\n1. **30/70 Differentiator:** Purani ERPs mein 70% data entry insaan karte hain. Neuroviax mein **70% kaam AI khud execute karta hai** aur sirf 30% high-risk approvals maangta hai.\n2. **Zero Deployment Delay:** Cloud-native MERN architecture, minute mein ready.\n3. **Native WhatsApp Integration:** Direct customer alerts bina kisi mehenge third-party plugin ke.\n4. **Autonomous Closed Loop (ABOP):** Stockout hone se pehle purchase order khud draft ho jata hai!`;
    } else {
      reply = `⚔️ **The Neuroviax 30/70 Differentiator vs Legacy ERPs:**\n\n• **Legacy ERPs (SAP, Odoo, Zoho, Tally):** 70% manual human clerical data entry, reactive reporting, high consultant fees.\n• **Neuroviax Autonomous ABOP:** Inverts the pyramid — **70% autonomous AI execution** with 30% human strategic sign-off.\n• **Zero Plugin Clutter:** Built-in ML Demand Forecasting, Isolation Forest Anomaly Detection, and native WhatsApp CRM.\n• **10x Cost Savings:** Enterprise capability at SME pricing ($29-$199/mo).`;
    }
    actions = [
      { label: '⚖️ View Full Comparison Matrix', path: '/differentiator', variant: 'primary' },
      { label: '🔄 Explore ABOP Loop', path: '/abop-loop', variant: 'secondary' },
    ];
  }

  // 9. HOW IT WORKS / ABOP LOOP / WHAT CAN AI DO
  else if (
    lowerMsg.includes('kaise') ||
    lowerMsg.includes('abop') ||
    lowerMsg.includes('loop') ||
    lowerMsg.includes('feature') ||
    lowerMsg.includes('kya kar') ||
    lowerMsg.includes('what can') ||
    lowerMsg.includes('help') ||
    lowerMsg.includes('guide') ||
    lowerMsg.includes('faida')
  ) {
    if (isUrdu) {
      reply = `⚡ **Neuroviax ABOP Loop Kaise Kaam Karta Hai?**\n\nNeuroviax ek **Autonomous Business Operating Platform** hai jo aapke business ke 5 marhale khud chala sakta hai:\n\n1. 📡 **Signal Ingestion:** Stock ghatne ya sale hone par signal capture hota hai.\n2. 🧠 **AI Analysis:** 6 specialized assistants (Sales, Procurement, Inventory, Finance, Risk, Support) situation analyse karte hain.\n3. 💡 **Recommendation:** ML confidence score ke sath action generate hota hai.\n4. 🚦 **Risk-Tiered Routing:** Low-risk kaam khud ho jate hain, bare transactions human approval mangte hain.\n5. 🔁 **Continuous Learning:** Har decision se AI mazeed behtar hota hai.\n\nAap niche diye buttons se direct explore kar sakte hain:`;
    } else {
      reply = `⚡ **How the Neuroviax ABOP Loop Operates:**\n\nNeuroviax operates as an **Autonomous Business Operating Platform** running an intelligent 5-step feedback loop:\n\n1. 📡 **Signal Ingestion:** Captures stock dips, order spikes, or unpaid invoices.\n2. 🧠 **Contextual AI Analysis:** 6 domain assistants (Procurement, Sales, Inventory, Finance, Risk, Support) evaluate rules & ML predictions.\n3. 💡 **Recommendation Scoring:** Generates actionable proposals with explainable confidence.\n4. 🚦 **Risk-Tiered Routing:** Low-risk auto-executes; high-risk requests one-click owner approval.\n5. 🔁 **Continuous Learning:** Refines forecasts with every accepted/rejected decision.\n\nExplore live modules below:`;
    }
    actions = [
      { label: '🔄 View ABOP Loop Architecture', path: '/abop-loop', variant: 'primary' },
      { label: '🤖 Explore 6 AI Assistants', path: '/assistants', variant: 'secondary' },
      { label: '📊 Demand Forecasting', path: '/demand-forecasting' },
    ];
  }

  // 7. GREETING / DEFAULT INTELLIGENT EXECUTIVE ASSISTANT
  else {
    if (isUrdu) {
      reply = `Assalam-o-Alaikum! Main **Neuroviax AI Copilot** hoon — aapke business ka autonomous operating assistant.\n\nMain aapki in cheezon mein real-time madad kar sakta hoon:\n• 📦 **Low Stock Check:** Stockout se pehle alert aur restock suggestion.\n• 💰 **Sales & Cash Flow:** Aaj ki sale, pending orders aur financial health.\n• 📱 **WhatsApp Leads:** Opted-in customers ko campaigns bhejna.\n• 🛡️ **Fraud & Anomaly Guard:** Suspicious transactions aur price changes detect karna.\n\nAap mujhse Urdu ya English mein kuch bhi pooch sakte hain ya quick actions select karein:`;
    } else {
      reply = `Hello! I am your **Neuroviax AI Copilot** — your real-time autonomous business operating assistant.\n\nI can assist you instantly with:\n• 📦 **Inventory & Low Stock:** Proactive stockout alerts & auto-purchase orders.\n• 💰 **Revenue & Orders:** Real-time revenue, order tracking, and cash-flow forecasting.\n• 📱 **WhatsApp Engagement:** Reach opted-in customers directly.\n• 🛡️ **Risk & Anomaly Guard:** Identify fraud, negative margins, and stock shrinkage.\n\nAsk me anything in plain English or Roman Urdu, or pick a quick action below:`;
    }
    actions = [
      { label: '🚨 Check Low Stock SKUs', path: '/inventory', variant: 'primary' },
      { label: '💰 Today\'s Revenue & Orders', path: '/orders', variant: 'secondary' },
      { label: '📱 WhatsApp Customers', path: '/customers' },
      { label: '🤖 AI Decision Hub', path: '/ai-assistants' },
    ];
    if (businessId) {
      snapshot = {
        lowStockCount: lowStockItems.length,
        totalRevenue,
        whatsappOptIns: whatsappCustomers.length,
      };
    }
  }

  res.json({
    reply,
    actions,
    snapshot,
    isUrdu,
    persona,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  copilotChat,
  getCopilotQuickStats,
};
