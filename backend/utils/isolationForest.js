'use strict';

/**
 * Neuroviax Machine Learning Core: Isolation Forest (iForest)
 * 
 * Unsupervised Anomaly Detection based on isolation properties of random binary trees.
 * Reference: Liu, Ting, & Zhou (2008) "Isolation Forest", IEEE ICDM.
 */

const EULER_MASCHERONI = 0.5772156649;

/**
 * Average path length of unsuccessful search in a Binary Search Tree (BST)
 * Equivalent to the average depth of an external node in a random tree of n samples.
 */
function c(n) {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + EULER_MASCHERONI) - (2 * (n - 1)) / n;
}

/**
 * Node in an Isolation Tree (iTree)
 */
class IsolationTreeNode {
  constructor({ isLeaf = false, size = 0, featureIdx = null, splitVal = null, left = null, right = null, depth = 0 }) {
    this.isLeaf = isLeaf;
    this.size = size;
    this.featureIdx = featureIdx;
    this.splitVal = splitVal;
    this.left = left;
    this.right = right;
    this.depth = depth;
  }
}

/**
 * Recursively builds an Isolation Tree
 */
function buildITree(X, currentDepth, maxDepth) {
  const n = X.length;

  if (currentDepth >= maxDepth || n <= 1) {
    return new IsolationTreeNode({ isLeaf: true, size: n, depth: currentDepth });
  }

  const numFeatures = X[0].length;
  // Find features with non-zero variance
  const validFeatures = [];
  const minMaxPerFeature = [];

  for (let f = 0; f < numFeatures; f++) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      const v = X[i][f];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    minMaxPerFeature[f] = { min, max };
    if (max > min) {
      validFeatures.push(f);
    }
  }

  // If all features are uniform, terminate as leaf
  if (validFeatures.length === 0) {
    return new IsolationTreeNode({ isLeaf: true, size: n, depth: currentDepth });
  }

  // Randomly select one valid feature
  const selectedFeature = validFeatures[Math.floor(Math.random() * validFeatures.length)];
  const { min, max } = minMaxPerFeature[selectedFeature];

  // Random split threshold strictly between min and max
  const splitVal = min + Math.random() * (max - min);

  const leftX = [];
  const rightX = [];
  for (let i = 0; i < n; i++) {
    if (X[i][selectedFeature] < splitVal) {
      leftX.push(X[i]);
    } else {
      rightX.push(X[i]);
    }
  }

  // Guard against degenerate partitions
  if (leftX.length === 0 || rightX.length === 0) {
    return new IsolationTreeNode({ isLeaf: true, size: n, depth: currentDepth });
  }

  const leftNode = buildITree(leftX, currentDepth + 1, maxDepth);
  const rightNode = buildITree(rightX, currentDepth + 1, maxDepth);

  return new IsolationTreeNode({
    isLeaf: false,
    size: n,
    featureIdx: selectedFeature,
    splitVal,
    left: leftNode,
    right: rightNode,
    depth: currentDepth,
  });
}

/**
 * Computes path length h(x) of sample x through an iTree
 */
function pathLength(x, node, currentDepth = 0, featureSplitDepths = {}) {
  if (node.isLeaf) {
    return currentDepth + c(node.size);
  }

  const fIdx = node.featureIdx;
  if (!featureSplitDepths[fIdx]) {
    featureSplitDepths[fIdx] = [];
  }
  featureSplitDepths[fIdx].push(currentDepth);

  if (x[fIdx] < node.splitVal) {
    return pathLength(x, node.left, currentDepth + 1, featureSplitDepths);
  } else {
    return pathLength(x, node.right, currentDepth + 1, featureSplitDepths);
  }
}

/**
 * Subsample array without replacement (or with replacement if n < sampleSize)
 */
function subSample(X, sampleSize) {
  const n = X.length;
  if (n <= sampleSize) return X.slice();

  const indices = new Set();
  while (indices.size < sampleSize) {
    indices.add(Math.floor(Math.random() * n));
  }
  return Array.from(indices).map((idx) => X[idx]);
}

/**
 * Isolation Forest Ensemble
 */
class IsolationForest {
  constructor({ nTrees = 100, subSampleSize = 256, contamination = 0.08 } = {}) {
    this.nTrees = nTrees;
    this.subSampleSize = subSampleSize;
    this.contamination = Math.max(0.01, Math.min(0.30, contamination));
    this.trees = [];
    this.psi = 0;
    this.maxDepth = 0;
    this.cPsi = 0;
    this.featureNames = [];
    this.featureStats = []; // Mean, stdDev, min, max
  }

  fit(X, featureNames = []) {
    if (!X || X.length === 0) {
      throw new Error('IsolationForest: Input data cannot be empty');
    }

    const n = X.length;
    const numFeatures = X[0].length;
    this.featureNames = featureNames.length === numFeatures 
      ? featureNames 
      : Array.from({ length: numFeatures }, (_, i) => `f_${i}`);

    // Compute basic feature statistics for normalization and attribution
    this.featureStats = [];
    for (let f = 0; f < numFeatures; f++) {
      const vals = X.map((x) => x[f]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, n - 1);
      const stdDev = Math.sqrt(variance) || 1;
      this.featureStats.push({ min, max, mean, stdDev });
    }

    this.psi = Math.min(n, this.subSampleSize);
    this.maxDepth = Math.ceil(Math.log2(Math.max(2, this.psi)));
    this.cPsi = c(this.psi);
    this.trees = [];

    for (let t = 0; t < this.nTrees; t++) {
      const sample = subSample(X, this.psi);
      const tree = buildITree(sample, 0, this.maxDepth);
      this.trees.push(tree);
    }

    return this;
  }

  /**
   * Scores a single vector x
   * Returns: { anomalyScore, meanPathLength, cPsi, isAnomaly, contributions }
   */
  scoreInstance(x) {
    if (this.trees.length === 0) {
      throw new Error('Model is not fitted yet.');
    }

    let totalPathLength = 0;
    const featureSplitCounts = {};
    const featureSplitSumDepths = {};

    for (const tree of this.trees) {
      const localDepths = {};
      const h = pathLength(x, tree, 0, localDepths);
      totalPathLength += h;

      for (const [fIdxStr, depths] of Object.entries(localDepths)) {
        const fIdx = Number(fIdxStr);
        featureSplitCounts[fIdx] = (featureSplitCounts[fIdx] || 0) + depths.length;
        featureSplitSumDepths[fIdx] = (featureSplitSumDepths[fIdx] || 0) + depths.reduce((a, b) => a + b, 0);
      }
    }

    const meanPathLength = totalPathLength / this.trees.length;
    // Anomaly score: s(x, n) = 2^(-E(h(x)) / c(psi))
    const score = this.cPsi > 0 ? Math.pow(2, -meanPathLength / this.cPsi) : 0.5;

    // Feature attribution (SHAP-inspired early isolation contribution):
    // Features that split the point at lower depths (closer to root) contribute most to isolation
    const contributions = [];
    const numFeatures = this.featureNames.length;
    let totalAttributionWeight = 0;

    for (let f = 0; f < numFeatures; f++) {
      const count = featureSplitCounts[f] || 0;
      const sumDepth = featureSplitSumDepths[f] || 0;
      const avgSplitDepth = count > 0 ? sumDepth / count : this.maxDepth;
      
      // Points isolated early have low avgSplitDepth; weight is inversely proportional to depth
      const depthCloseness = Math.max(0, this.maxDepth - avgSplitDepth + 1);
      
      // Z-score magnitude from merchant baseline
      const stats = this.featureStats[f] || { mean: 0, stdDev: 1 };
      const zScore = Math.abs((x[f] - stats.mean) / (stats.stdDev || 1));

      const rawWeight = depthCloseness * (1 + Math.min(3, zScore * 0.5));
      totalAttributionWeight += rawWeight;

      contributions.push({
        featureIndex: f,
        featureName: this.featureNames[f],
        value: x[f],
        zScore: parseFloat(zScore.toFixed(2)),
        rawWeight,
        avgSplitDepth: parseFloat(avgSplitDepth.toFixed(2)),
      });
    }

    // Normalize contributions to percentages
    const sortedContributions = contributions
      .map((c) => ({
        ...c,
        percentage: totalAttributionWeight > 0 ? Math.round((c.rawWeight / totalAttributionWeight) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      anomalyScore: parseFloat(score.toFixed(4)),
      meanPathLength: parseFloat(meanPathLength.toFixed(2)),
      cPsi: parseFloat(this.cPsi.toFixed(2)),
      contributions: sortedContributions,
    };
  }

  /**
   * Predict on a dataset X
   */
  predict(X) {
    const scores = X.map((x) => this.scoreInstance(x));
    
    // Sort scores descending to determine contamination threshold
    const sortedScores = scores.map((s) => s.anomalyScore).sort((a, b) => b - a);
    const cutoffIndex = Math.max(0, Math.min(sortedScores.length - 1, Math.floor(sortedScores.length * this.contamination)));
    const dynamicThreshold = Math.max(0.55, sortedScores[cutoffIndex] || 0.60);

    return scores.map((s) => ({
      ...s,
      isAnomaly: s.anomalyScore >= dynamicThreshold,
      threshold: dynamicThreshold,
      riskTier: s.anomalyScore >= 0.75 ? 'critical' : s.anomalyScore >= 0.65 ? 'high' : s.anomalyScore >= 0.55 ? 'medium' : 'low',
    }));
  }
}

module.exports = {
  IsolationForest,
  IsolationTreeNode,
  buildITree,
  pathLength,
  c,
};
