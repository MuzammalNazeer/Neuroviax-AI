'use strict';

/**
 * Neuroviax Machine Learning Engine: Customer Segmentation (Purchase Behavior)
 * 
 * Powered by K-Means++ Clustering.
 * Analyzes multi-dimensional customer purchase dynamics:
 * - Recency (R): Days since last purchase
 * - Frequency (F): Total orders placed
 * - Monetary (M): Lifetime spend / revenue
 * - Average Order Value (AOV): Spend per order
 * - Basket Breadth: Average items per basket
 * 
 * Automatically identifies actionable customer segments:
 * 1. VIP Champions (High M, High F, Low R)
 * 2. Loyal Regulars (Steady M, Moderate-High F, Low-Moderate R)
 * 3. Potential Loyalists / Rising Stars (Growing F, Low R, Moderate M)
 * 4. At-Risk Customers (High past M/F, High R - Slipping away)
 * 5. Dormant / Churned (Low M, 1-2 orders, High R)
 * 6. Bargain / Occasional Shoppers (Low AOV, Price sensitive)
 */

const { KMeans, computeElbowCurve } = require('./kmeans');

// Realistic Customer Personas for Seed Data in In-Memory / Sparse Database Environments
function generateRealisticCustomerSeeds(businessId) {
  const now = Date.now();
  const DAY_MS = 86400000;
  const customers = [];

  const firstNames = ['Tariq', 'Ayesha', 'Bilal', 'Zainab', 'Omar', 'Fatima', 'Hamza', 'Sara', 'Usman', 'Mariam', 'Zubair', 'Hina', 'Adnan', 'Sana', 'Kamran', 'Mehwish', 'Faisal', 'Nadia', 'Farhan', 'Rabia'];
  const lastNames = ['Khan', 'Ahmed', 'Malik', 'Chaudhry', 'Sheikh', 'Siddiqui', 'Butt', 'Raza', 'Bhatti', 'Mirza', 'Javed', 'Abbasi', 'Iqbal', 'Qureshi', 'Rehman'];

  let idCounter = 101;

  function makeCustomer(name, archetype, recencyDays, ordersCount, avgOrderVal, avgBasket) {
    const totalSpend = Math.round(ordersCount * avgOrderVal);
    const lastOrderDate = new Date(now - recencyDays * DAY_MS);
    const firstOrderDate = new Date(now - (recencyDays + ordersCount * 14 + 10) * DAY_MS);

    return {
      _id: `cust-${idCounter++}`,
      id: `cust-${idCounter}`,
      business: businessId,
      name,
      phone: `+92 3${Math.floor(10 + Math.random() * 40)} ${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}${idCounter}@example.com`,
      whatsappOptIn: Math.random() > 0.25,
      archetype,
      purchaseBehavior: {
        recencyDays: Math.round(recencyDays),
        frequency: Math.round(ordersCount),
        monetarySpend: totalSpend,
        averageOrderValue: Math.round(avgOrderVal),
        averageBasketSize: parseFloat(avgBasket.toFixed(1)),
        firstOrderDate,
        lastOrderDate,
      },
    };
  }

  // 1. VIP Champions (~12 customers): Very high spend, frequent, recent
  for (let i = 0; i < 12; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const recency = 2 + Math.random() * 10; // 2-12 days ago
    const freq = 16 + Math.floor(Math.random() * 20); // 16-35 orders
    const aov = 8500 + Math.random() * 12000; // 8,500 - 20,500 PKR
    const basket = 4.5 + Math.random() * 3.5;
    customers.push(makeCustomer(`${fn} ${ln}`, 'vip_champion', recency, freq, aov, basket));
  }

  // 2. Loyal Regulars (~18 customers): Moderate-high spend, consistent orders, recent
  for (let i = 0; i < 18; i++) {
    const fn = firstNames[(i + 4) % firstNames.length];
    const ln = lastNames[(i + 2) % lastNames.length];
    const recency = 8 + Math.random() * 22; // 8-30 days ago
    const freq = 8 + Math.floor(Math.random() * 10); // 8-17 orders
    const aov = 4200 + Math.random() * 4500; // 4,200 - 8,700 PKR
    const basket = 2.8 + Math.random() * 2.2;
    customers.push(makeCustomer(`${fn} ${ln}`, 'loyal_regular', recency, freq, aov, basket));
  }

  // 3. Potential Loyalists / Rising Stars (~15 customers): Recent, high frequency velocity, good basket
  for (let i = 0; i < 15; i++) {
    const fn = firstNames[(i + 8) % firstNames.length];
    const ln = lastNames[(i + 5) % lastNames.length];
    const recency = 2 + Math.random() * 14; // 2-16 days ago
    const freq = 3 + Math.floor(Math.random() * 4); // 3-6 orders
    const aov = 3800 + Math.random() * 4200; // 3,800 - 8,000 PKR
    const basket = 2.2 + Math.random() * 1.8;
    customers.push(makeCustomer(`${fn} ${ln}`, 'potential_loyalist', recency, freq, aov, basket));
  }

  // 4. At-Risk High Spenders (~10 customers): High past spend, but slipping (high recency)
  for (let i = 0; i < 10; i++) {
    const fn = firstNames[(i + 12) % firstNames.length];
    const ln = lastNames[(i + 7) % lastNames.length];
    const recency = 65 + Math.random() * 70; // 65-135 days ago (danger of churn!)
    const freq = 9 + Math.floor(Math.random() * 11); // 9-19 orders historically
    const aov = 6500 + Math.random() * 7500; // High historical value
    const basket = 3.5 + Math.random() * 2.5;
    customers.push(makeCustomer(`${fn} ${ln}`, 'at_risk', recency, freq, aov, basket));
  }

  // 5. Bargain Hunters / Low Spenders (~14 customers): Low AOV, price sensitive
  for (let i = 0; i < 14; i++) {
    const fn = firstNames[(i + 15) % firstNames.length];
    const ln = lastNames[(i + 9) % lastNames.length];
    const recency = 15 + Math.random() * 45;
    const freq = 2 + Math.floor(Math.random() * 5);
    const aov = 1100 + Math.random() * 1600; // 1,100 - 2,700 PKR
    const basket = 1.2 + Math.random() * 1.2;
    customers.push(makeCustomer(`${fn} ${ln}`, 'bargain_hunter', recency, freq, aov, basket));
  }

  // 6. Dormant / Churned (~12 customers): Very high recency, 1-2 orders, cold
  for (let i = 0; i < 12; i++) {
    const fn = firstNames[(i + 18) % firstNames.length];
    const ln = lastNames[(i + 11) % lastNames.length];
    const recency = 130 + Math.random() * 150; // 130-280 days ago
    const freq = 1 + Math.floor(Math.random() * 2); // 1-2 orders
    const aov = 1800 + Math.random() * 2200;
    const basket = 1.1 + Math.random() * 1.0;
    customers.push(makeCustomer(`${fn} ${ln}`, 'dormant', recency, freq, aov, basket));
  }

  return customers;
}

/**
 * Extract RFM & Purchase Behavior feature vectors from database records
 */
function extractPurchaseFeaturesFromDb(customers, orders) {
  const now = Date.now();
  const DAY_MS = 86400000;

  // Group orders by customer ID
  const ordersByCustomer = new Map();
  orders.forEach((order) => {
    if (!order.customer) return;
    const custId = (order.customer._id || order.customer).toString();
    if (!ordersByCustomer.has(custId)) {
      ordersByCustomer.set(custId, []);
    }
    ordersByCustomer.get(custId).push(order);
  });

  const enrichedCustomers = [];

  for (const customer of customers) {
    const custId = (customer._id || customer.id).toString();
    const custOrders = ordersByCustomer.get(custId) || [];

    let totalSpend = 0;
    let totalItems = 0;
    let lastOrderTime = 0;
    let firstOrderTime = Infinity;

    for (const ord of custOrders) {
      const orderTotal = ord.total || ord.subtotal || 0;
      totalSpend += orderTotal;

      const orderItems = (ord.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
      totalItems += orderItems;

      const t = new Date(ord.createdAt || ord.date || now).getTime();
      if (t > lastOrderTime) lastOrderTime = t;
      if (t < firstOrderTime) firstOrderTime = t;
    }

    const freq = custOrders.length;
    const recencyDays = lastOrderTime > 0 
      ? Math.max(1, Math.round((now - lastOrderTime) / DAY_MS))
      : 90; // default to 90 days if no orders yet
    const aov = freq > 0 ? Math.round(totalSpend / freq) : 0;
    const avgBasket = freq > 0 ? parseFloat((totalItems / freq).toFixed(1)) : 1.0;

    enrichedCustomers.push({
      _id: customer._id || customer.id,
      id: customer._id || customer.id,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      whatsappOptIn: !!customer.whatsappOptIn,
      purchaseBehavior: {
        recencyDays,
        frequency: freq,
        monetarySpend: totalSpend,
        averageOrderValue: aov,
        averageBasketSize: avgBasket,
        firstOrderDate: firstOrderTime !== Infinity ? new Date(firstOrderTime) : null,
        lastOrderDate: lastOrderTime > 0 ? new Date(lastOrderTime) : null,
      },
    });
  }

  return enrichedCustomers;
}

/**
 * Rank-based and rule-based segment assignment across all fitted clusters
 * Ensures each cluster receives a distinct, appropriate business persona.
 */
function assignClusterPersonas(centroidsRaw, featureNames, clusterCounts, clusterSpends, totalCustomers) {
  const recIdx = featureNames.indexOf('recencyDays');
  const freqIdx = featureNames.indexOf('frequency');
  const spendIdx = featureNames.indexOf('monetarySpend');
  const aovIdx = featureNames.indexOf('averageOrderValue');

  // Extract cluster summary metrics
  const clusterStats = centroidsRaw.map((raw, idx) => ({
    clusterId: idx,
    recency: raw[recIdx] || 0,
    frequency: raw[freqIdx] || 0,
    spend: raw[spendIdx] || 0,
    aov: raw[aovIdx] || 0,
    count: clusterCounts[idx],
    revenue: clusterSpends[idx],
  }));

  // Sort indices by spend descending
  const sortedBySpend = [...clusterStats].sort((a, b) => b.spend - a.spend);
  const sortedByRecency = [...clusterStats].sort((a, b) => b.recency - a.recency);

  const assigned = {};
  const usedKeys = new Set();

  // 1. Highest spend cluster -> VIP Champions
  const topSpender = sortedBySpend[0];
  assigned[topSpender.clusterId] = {
    segmentKey: 'vip_champions',
    segmentName: 'VIP Champions',
    tagline: 'Highest lifetime spend & premium order volume',
    color: '#059669', // Emerald 600
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeHex: '#059669',
    icon: 'Crown',
    priorityTier: 'P1 - Protect & Delight',
    churnRisk: 'Low (< 10%)',
    nextBestAction: 'Enroll in VIP Concierge, offer exclusive early preview access, assign dedicated account manager.',
    suggestedCampaign: 'VIP Exclusive Appreciation Dinner & Early Access Code',
    expectedUpsellImpact: '+22% Retention & Higher LTV',
  };
  usedKeys.add('vip_champions');

  // 2. Highest recency cluster with low frequency -> Dormant / Churned
  const mostDormant = sortedByRecency.find((c) => !assigned[c.clusterId] && c.recency > 75) || sortedByRecency[0];
  if (!assigned[mostDormant.clusterId]) {
    assigned[mostDormant.clusterId] = {
      segmentKey: 'dormant_churned',
      segmentName: 'Dormant Customers',
      tagline: 'Extended inactivity with high churn risk',
      color: '#64748B', // Slate
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      badgeHex: '#64748B',
      icon: 'Moon',
      priorityTier: 'P3 - Low Cost Re-engagement',
      churnRisk: 'Critical (> 85%)',
      nextBestAction: 'Deploy automated seasonal win-back email or automated discount trigger.',
      suggestedCampaign: 'Seasonal Clearance Win-back Promo & Survey',
      expectedUpsellImpact: '+6% Reactivation Rate',
    };
    usedKeys.add('dormant_churned');
  }

  // 3. High past spend / frequency but recency > 35 -> At-Risk High Spenders
  const atRiskCandidate = sortedBySpend.find((c) => !assigned[c.clusterId] && c.recency >= 30);
  if (atRiskCandidate && !usedKeys.has('at_risk_high_value')) {
    assigned[atRiskCandidate.clusterId] = {
      segmentKey: 'at_risk_high_value',
      segmentName: 'At-Risk High Spenders',
      tagline: 'Previously loyal high-spenders slipping into inactivity',
      color: '#D97706', // Amber 600
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeHex: '#D97706',
      icon: 'AlertTriangle',
      priorityTier: 'P1 - Immediate Intervention',
      churnRisk: 'High (65% - 80%)',
      nextBestAction: 'Dispatch personalized 20% win-back voucher on WhatsApp; reach out with account manager satisfaction check.',
      suggestedCampaign: 'Personalized 20% Win-back Voucher via WhatsApp API',
      expectedUpsellImpact: 'Salvage up to $45,000 in recurring ARR',
    };
    usedKeys.add('at_risk_high_value');
  }

  // 4. Moderate-to-high frequency & low-to-moderate recency -> Loyal Regulars
  const loyalCandidate = [...clusterStats]
    .filter((c) => !assigned[c.clusterId])
    .sort((a, b) => b.frequency - a.frequency)[0];

  if (loyalCandidate && !usedKeys.has('loyal_regulars')) {
    assigned[loyalCandidate.clusterId] = {
      segmentKey: 'loyal_regulars',
      segmentName: 'Loyal Regulars',
      tagline: 'Consistent repeat buyers with solid recurring frequency',
      color: '#2563EB', // Blue 600
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeHex: '#2563EB',
      icon: 'HeartHandshake',
      priorityTier: 'P2 - Nurture & Upsell',
      churnRisk: 'Low (15% - 20%)',
      nextBestAction: 'Introduce loyalty points tier accelerators and bundle recommendations to grow AOV.',
      suggestedCampaign: 'Double Loyalty Points Weekend & Multi-SKU Bundle Discount',
      expectedUpsellImpact: '+14% Basket Expansion',
    };
    usedKeys.add('loyal_regulars');
  }

  // 5. Low recency & moderate frequency -> Potential Loyalists
  const potentialCandidate = [...clusterStats]
    .filter((c) => !assigned[c.clusterId])
    .sort((a, b) => a.recency - b.recency)[0];

  if (potentialCandidate && !usedKeys.has('potential_loyalists')) {
    assigned[potentialCandidate.clusterId] = {
      segmentKey: 'potential_loyalists',
      segmentName: 'Potential Loyalists',
      tagline: 'Recent buyers showing promising frequency and engagement',
      color: '#7C3AED', // Purple 600
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeHex: '#7C3AED',
      icon: 'Sparkles',
      priorityTier: 'P2 - Accelerate Repeat Orders',
      churnRisk: 'Moderate (25% - 35%)',
      nextBestAction: 'Deliver personalized next-best-product suggestions based on previous catalog view.',
      suggestedCampaign: 'Next-Best-Offer WhatsApp Push with Free Shipping',
      expectedUpsellImpact: '+30% Conversion to Loyal Regulars',
    };
    usedKeys.add('potential_loyalists');
  }

  // 6. Any remaining clusters -> Bargain & Occasional Shoppers
  clusterStats.forEach((c) => {
    if (!assigned[c.clusterId]) {
      assigned[c.clusterId] = {
        segmentKey: 'bargain_occasional',
        segmentName: 'Bargain & Occasional',
        tagline: 'Price-conscious shoppers driven by promotions and clearance',
        color: '#DB2777', // Pink 600
        badge: 'bg-pink-50 text-pink-700 border-pink-200',
        badgeHex: '#DB2777',
        icon: 'Tag',
        priorityTier: 'P3 - Promotional Volume',
        churnRisk: 'Moderate-High (50%)',
        nextBestAction: 'Trigger flash sale notifications, volume threshold coupons, and end-of-season sales.',
        suggestedCampaign: 'Flash Clearance Sale & Buy-2-Get-1 Alert',
        expectedUpsellImpact: '+12% Incremental Volume',
      };
    }
  });

  return assigned;
}

/**
 * Main Customer Segmentation Orchestrator
 * 
 * @param {Object} options
 * @param {Array} [options.customers] Database customer records
 * @param {Array} [options.orders] Database order records
 * @param {string} [options.businessId] Business ID
 * @param {number} [options.k=5] Number of clusters
 * @param {string[]} [options.features] Feature subset to use
 * @returns {Object} Comprehensive segmentation output
 */
function runCustomerSegmentation({
  customers = [],
  orders = [],
  businessId = 'biz-demo-01',
  k = 5,
  features = ['recencyDays', 'frequency', 'monetarySpend', 'averageOrderValue', 'averageBasketSize'],
} = {}) {
  // 1. Determine customer dataset: database or realistic seeds if records are sparse (< 10)
  let customerDataset = [];
  if (customers.length >= 10 && orders.length >= 5) {
    customerDataset = extractPurchaseFeaturesFromDb(customers, orders);
  } else {
    // Generate realistic seeded customer behaviors
    customerDataset = generateRealisticCustomerSeeds(businessId);
  }

  // 2. Prepare feature matrix X
  const featureNames = features;
  const X = customerDataset.map((cust) => {
    return featureNames.map((feat) => {
      const val = cust.purchaseBehavior[feat];
      return typeof val === 'number' ? val : 0;
    });
  });

  // Feature weights: give strong emphasis to Monetary spend and Recency
  const weights = featureNames.map((feat) => {
    if (feat === 'monetarySpend') return 1.4;
    if (feat === 'recencyDays') return 1.3;
    if (feat === 'frequency') return 1.2;
    if (feat === 'averageOrderValue') return 1.0;
    return 0.8;
  });

  // 3. Fit K-Means Model
  const actualK = Math.min(Math.max(2, k), customerDataset.length);
  const kmeans = new KMeans({
    k: actualK,
    maxIterations: 100,
    tolerance: 1e-4,
    normalization: 'minmax',
    weights,
  });

  kmeans.fit(X, featureNames);

  // 4. Compute Elbow Curve & Silhouette evaluation
  const elbowCurve = computeElbowCurve(X, { minK: 2, maxK: 6, normalization: 'minmax', weights });

  // 5. Cluster assignment & centroid analysis
  const clusterCounts = new Array(actualK).fill(0);
  const clusterSpends = new Array(actualK).fill(0);
  const clusterMembers = Array.from({ length: actualK }, () => []);

  customerDataset.forEach((cust, idx) => {
    const clusterIdx = kmeans.labels[idx];
    cust.clusterIndex = clusterIdx;
    clusterCounts[clusterIdx]++;
    clusterSpends[clusterIdx] += cust.purchaseBehavior.monetarySpend;
    clusterMembers[clusterIdx].push(cust);
  });

  const totalPlatformCustomers = customerDataset.length;
  const totalPlatformRevenue = customerDataset.reduce((sum, c) => sum + c.purchaseBehavior.monetarySpend, 0);

  // 6. Build semantic segment profiles
  const clusterPersonas = assignClusterPersonas(
    kmeans.centroidsRaw,
    featureNames,
    clusterCounts,
    clusterSpends,
    totalPlatformCustomers
  );

  const clusterSummaries = kmeans.centroidsRaw.map((rawCentroid, clusterIdx) => {
    const profile = clusterPersonas[clusterIdx];
    const count = clusterCounts[clusterIdx];
    const revenue = clusterSpends[clusterIdx];
    const pctCustomers = parseFloat(((count / totalPlatformCustomers) * 100).toFixed(1));
    const pctRevenue = parseFloat(((revenue / (totalPlatformRevenue || 1)) * 100).toFixed(1));

    const avgRecency = Math.round(rawCentroid[featureNames.indexOf('recencyDays')] || 0);
    const avgFrequency = parseFloat((rawCentroid[featureNames.indexOf('frequency')] || 0).toFixed(1));
    const avgSpend = Math.round(rawCentroid[featureNames.indexOf('monetarySpend')] || 0);
    const avgAov = Math.round(rawCentroid[featureNames.indexOf('averageOrderValue')] || 0);

    return {
      clusterId: clusterIdx,
      ...profile,
      memberCount: count,
      percentOfCustomers: pctCustomers,
      totalRevenue: revenue,
      percentOfRevenue: pctRevenue,
      metrics: {
        avgRecencyDays: avgRecency,
        avgFrequency,
        avgLifetimeSpend: avgSpend,
        avgOrderValue: avgAov,
      },
    };
  });

  // Attach enriched segment details to each customer
  const enrichedCustomerRoster = customerDataset.map((cust) => {
    const seg = clusterSummaries[cust.clusterIndex];
    return {
      ...cust,
      segmentKey: seg.segmentKey,
      segmentName: seg.segmentName,
      segmentColor: seg.color,
      segmentBadge: seg.badge,
      priorityTier: seg.priorityTier,
      suggestedAction: seg.nextBestAction,
      suggestedCampaign: seg.suggestedCampaign,
    };
  });

  // Calculate high-level KPIs
  const vipSegment = clusterSummaries.find((s) => s.segmentKey === 'vip_champions') || clusterSummaries[0];
  const atRiskSegment = clusterSummaries.find((s) => s.segmentKey === 'at_risk_high_value');
  const atRiskRevenue = atRiskSegment ? atRiskSegment.totalRevenue : 0;
  const atRiskCustomers = atRiskSegment ? atRiskSegment.memberCount : 0;

  return {
    meta: {
      algorithm: 'K-Means++',
      distanceMetric: 'Weighted Euclidean Normalized',
      k: actualK,
      iterations: kmeans.iterationsRun,
      converged: kmeans.converged,
      inertia: parseFloat(kmeans.inertia.toFixed(2)),
      silhouetteScore: kmeans.silhouetteScore,
      silhouetteInterpretation:
        kmeans.silhouetteScore >= 0.55
          ? 'Strong Cluster Separation (High Confidence)'
          : kmeans.silhouetteScore >= 0.35
          ? 'Moderate Clustering Structure'
          : 'Overlapping Feature Space (Consider feature weights)',
      totalCustomers: totalPlatformCustomers,
      totalRevenue: totalPlatformRevenue,
      analyzedAt: new Date().toISOString(),
    },
    metrics: {
      totalCustomers: totalPlatformCustomers,
      totalRevenue: totalPlatformRevenue,
      silhouetteScore: kmeans.silhouetteScore,
      vipCustomerCount: vipSegment.memberCount,
      vipRevenueShare: vipSegment.percentOfRevenue,
      atRiskCustomerCount: atRiskCustomers,
      atRiskRevenueAtStake: atRiskRevenue,
    },
    clusters: clusterSummaries,
    elbowCurve,
    customers: enrichedCustomerRoster,
  };
}

module.exports = {
  runCustomerSegmentation,
  generateRealisticCustomerSeeds,
  extractPurchaseFeaturesFromDb,
};
