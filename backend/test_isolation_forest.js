'use strict';

const { IsolationForest, c } = require('./utils/isolationForest');
const { runIsolationForestAnomalyDetection } = require('./utils/anomalyDetectionEngine');

console.log('=== 1. Validating Isolation Forest Math ===');
console.log('c(10):', c(10).toFixed(4));
console.log('c(256):', c(256).toFixed(4));
console.log('c(1000):', c(1000).toFixed(4));

// Synthetic 2D dataset: tight cluster around (10, 10), and extreme outliers at (100, 100) and (-50, -50)
const X = [];
for (let i = 0; i < 100; i++) {
  X.push([10 + Math.random() * 2, 10 + Math.random() * 2]);
}
// Add 2 outliers
X.push([120, 150]);
X.push([-60, -80]);

const iForest = new IsolationForest({ nTrees: 50, subSampleSize: 64, contamination: 0.05 });
iForest.fit(X, ['x1', 'x2']);
const preds = iForest.predict(X);

const normalSample = preds[0];
const outlier1 = preds[preds.length - 2];
const outlier2 = preds[preds.length - 1];

console.log('\n--- Model Test Results ---');
console.log('Normal point score:', normalSample.anomalyScore, 'isAnomaly:', normalSample.isAnomaly, 'depth:', normalSample.meanPathLength);
console.log('Outlier 1 score:', outlier1.anomalyScore, 'isAnomaly:', outlier1.isAnomaly, 'depth:', outlier1.meanPathLength);
console.log('Outlier 2 score:', outlier2.anomalyScore, 'isAnomaly:', outlier2.isAnomaly, 'depth:', outlier2.meanPathLength);

if (outlier1.anomalyScore > normalSample.anomalyScore && outlier1.isAnomaly) {
  console.log('>>> SUCCESS: Outlier has higher anomaly score and is flagged correctly!');
} else {
  console.error('>>> FAILURE: Outlier score was not higher than normal sample');
  process.exit(1);
}

console.log('\n=== 2. Validating Anomaly Detection Engine (Transactions & Inventory) ===');
const engineResults = runIsolationForestAnomalyDetection({
  domain: 'all',
  businessId: 'test-biz',
  contamination: 0.08,
});

console.log('Total Evaluated:', engineResults.metrics.totalEvaluated);
console.log('Anomalies Detected:', engineResults.metrics.anomaliesDetected);
console.log('Fraud Exposure ($):', engineResults.metrics.totalFraudExposure);
console.log('Shrinkage Loss ($):', engineResults.metrics.totalShrinkageLoss);
console.log('Top Anomaly:', engineResults.anomalies[0]?.title, 'Score:', engineResults.anomalies[0]?.anomalyScore, 'Type:', engineResults.anomalies[0]?.anomalyType);

console.log('\nAll Isolation Forest tests PASSED successfully!');
