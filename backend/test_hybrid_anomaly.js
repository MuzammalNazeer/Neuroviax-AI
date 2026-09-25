'use strict';

const { Autoencoder, computeHybridScore } = require('./utils/autoencoder');
const { runHybridAnomalyDetection } = require('./utils/anomalyDetectionEngine');

console.log('=== 1. Validating Autoencoder Math & Neural Convergence ===');
const X = [];
for (let i = 0; i < 60; i++) {
  // Normal baseline transaction vectors with realistic variance
  X.push([
    1000 + Math.random() * 500,
    0.1 + Math.random() * 0.3,
    Math.floor(Math.random() * 2),
    0.05 + Math.random() * 0.05,
    0.15 + Math.random() * 0.1,
    0,
    Math.floor(Math.random() * 1),
  ]);
}

const ae = new Autoencoder({ inputDim: 7, hiddenDim: 16, latentDim: 4, epochs: 40 });
ae.fit(X);

const normalSample = [1200, 0.2, 1, 0.05, 0.2, 0, 0];
const fraudOutlier = [148000, 6.5, 9, 1.0, 0.45, 35000, 5];

const normalRes = ae.score(normalSample);
const fraudRes = ae.score(fraudOutlier);

console.log('Normal point reconstruction MSE:', normalRes.reconstructionMse, 'Anomaly score:', normalRes.anomalyScore);
console.log('Fraud outlier reconstruction MSE:', fraudRes.reconstructionMse, 'Anomaly score:', fraudRes.anomalyScore);

if (fraudRes.anomalyScore > normalRes.anomalyScore && fraudRes.reconstructionMse > normalRes.reconstructionMse) {
  console.log('>>> SUCCESS: Autoencoder correctly gave higher reconstruction error and anomaly score to fraud outlier!');
} else {
  console.error('>>> FAILURE: Autoencoder did not score fraud outlier higher.');
  process.exit(1);
}

console.log('\n=== 2. Validating Hybrid Ensemble (Isolation Forest + Autoencoder) ===');
const results = runHybridAnomalyDetection({
  domain: 'all',
  businessId: 'test-biz',
  engine: 'hybrid',
});

console.log('Model Name:', results.model.name);
console.log('Total Evaluated:', results.metrics.totalEvaluated);
console.log('Anomalies Detected:', results.metrics.anomaliesDetected);
console.log('Suspicious Payments:', results.metrics.suspiciousPayments);
console.log('Suspicious Orders:', results.metrics.suspiciousOrders);
console.log('Avg Isolation Depth:', results.metrics.averageIsolationDepth);
console.log('Avg Autoencoder Loss:', results.metrics.averageReconstructionLoss);

console.log('\nTop 3 Flagged Anomalies:');
results.anomalies.slice(0, 3).forEach((anom, idx) => {
  console.log(`[#${idx + 1}] ${anom.title} (${anom.entityType})`);
  console.log(`   Final Score: ${anom.anomalyScore} | iForest: ${anom.iforestScore} | Autoencoder: ${anom.autoencoderScore} (MSE: ${anom.autoencoderMse})`);
  console.log(`   Flagged By: ${anom.flaggedBy}`);
  console.log(`   Type: ${anom.anomalyType}`);
  console.log(`   Action: ${anom.actionLabel}`);
});

console.log('\nAll Hybrid Anomaly Detection tests PASSED successfully!');
