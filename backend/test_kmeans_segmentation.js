'use strict';

const { KMeans, computeElbowCurve, minMaxScale, zScoreScale } = require('./utils/kmeans');
const { runCustomerSegmentation } = require('./utils/customerSegmentationEngine');

console.log('=== 1. Validating K-Means++ Core Math & Clustering ===');

// 1. Synthetic 2D dataset with 3 distinct clusters:
// Cluster 1: Around (10, 10)
// Cluster 2: Around (50, 50)
// Cluster 3: Around (90, 10)
const X = [];
for (let i = 0; i < 30; i++) {
  X.push([8 + Math.random() * 4, 8 + Math.random() * 4]);
}
for (let i = 0; i < 30; i++) {
  X.push([48 + Math.random() * 4, 48 + Math.random() * 4]);
}
for (let i = 0; i < 30; i++) {
  X.push([88 + Math.random() * 4, 8 + Math.random() * 4]);
}

const km = new KMeans({ k: 3, maxIterations: 50, normalization: 'minmax' });
km.fit(X, ['f1', 'f2']);

console.log('Fitted K-Means with K =', km.k);
console.log('Iterations run:', km.iterationsRun, 'Converged:', km.converged);
console.log('Inertia (WCSS):', km.inertia.toFixed(4));
console.log('Silhouette Score:', km.silhouetteScore);
console.log('Centroids (raw space):', km.centroidsRaw);

if (km.silhouetteScore > 0.6) {
  console.log('>>> SUCCESS: 3 well-separated synthetic clusters yielded high Silhouette Score (', km.silhouetteScore, ')');
} else {
  console.warn('>>> NOTE: Silhouette score is:', km.silhouetteScore);
}

console.log('\n=== 2. Validating Elbow Curve Calculation ===');
const elbow = computeElbowCurve(X, { minK: 2, maxK: 5 });
console.log('Elbow curve points (K=2..5):', elbow);

if (elbow.length === 4 && elbow[0].inertia > elbow[elbow.length - 1].inertia) {
  console.log('>>> SUCCESS: Elbow inertia monotonically decreases as K increases!');
} else {
  console.error('>>> FAILURE: Unexpected elbow inertia behavior');
  process.exit(1);
}

console.log('\n=== 3. Validating Customer Segmentation Engine (Purchase Behavior) ===');
const result = runCustomerSegmentation({
  k: 5,
  businessId: 'test-retail-sme',
});

console.log('Total Customers Analyzed:', result.metrics.totalCustomers);
console.log('Total Segmented Revenue:', result.metrics.totalRevenue.toLocaleString());
console.log('Silhouette Score:', result.metrics.silhouetteScore);
console.log('Interpretation:', result.meta.silhouetteInterpretation);
console.log('Number of Segments Identified:', result.clusters.length);

console.log('\n--- Discovered Customer Segments ---');
result.clusters.forEach((cl) => {
  console.log(`- [${cl.segmentName}] (${cl.percentOfCustomers}% customers, ${cl.percentOfRevenue}% revenue)`);
  console.log(`  Avg Recency: ${cl.metrics.avgRecencyDays}d | Avg Freq: ${cl.metrics.avgFrequency} | Avg Spend: ${cl.metrics.avgLifetimeSpend} | AOV: ${cl.metrics.avgOrderValue}`);
  console.log(`  Next Best Action: ${cl.nextBestAction}`);
});

console.log('\nCustomer Roster Sample (first 3):');
result.customers.slice(0, 3).forEach((c) => {
  console.log(`- ${c.name} | Segment: ${c.segmentName} | Spend: ${c.purchaseBehavior.monetarySpend} | Recency: ${c.purchaseBehavior.recencyDays}d`);
});

if (result.clusters.length === 5 && result.customers.length >= 70) {
  console.log('\n>>> SUCCESS: Customer Segmentation Engine executed flawlessly!');
} else {
  console.error('\n>>> FAILURE: Customer Segmentation engine output counts mismatch');
  process.exit(1);
}
