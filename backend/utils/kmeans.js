'use strict';

/**
 * Neuroviax Machine Learning Core: K-Means Clustering Algorithm
 * 
 * Features:
 * - K-Means++ initialization for superior centroid seeding (Arthur & Vassilvitskii 2007)
 * - Multi-dimensional Euclidean distance with optional feature weighting
 * - Z-score & Min-Max feature normalization to prevent scale dominance
 * - Lloyd's iteration with convergence tolerance (epsilon) & iteration limits
 * - Dynamic empty cluster re-seeding from farthest outliers
 * - Inertia / Within-Cluster Sum of Squares (WCSS)
 * - Silhouette Score calculation for cluster quality evaluation
 * - Elbow analysis utility for finding optimal K in [2, maxK]
 */

/**
 * Compute Euclidean distance between two n-dimensional vectors
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {number[]} [weights] Optional feature weights
 * @returns {number}
 */
function euclideanDistance(a, b, weights = null) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    const w = weights ? weights[i] : 1;
    sum += w * diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Standardize dataset using Min-Max scaling to [0, 1] range
 * @param {number[][]} X Raw feature matrix
 * @returns {{ scaled: number[][], min: number[], max: number[] }}
 */
function minMaxScale(X) {
  if (!X || X.length === 0) return { scaled: [], min: [], max: [] };
  const numFeatures = X[0].length;
  const min = new Array(numFeatures).fill(Infinity);
  const max = new Array(numFeatures).fill(-Infinity);

  for (let i = 0; i < X.length; i++) {
    for (let f = 0; f < numFeatures; f++) {
      if (X[i][f] < min[f]) min[f] = X[i][f];
      if (X[i][f] > max[f]) max[f] = X[i][f];
    }
  }

  const scaled = X.map((row) =>
    row.map((val, f) => {
      const range = max[f] - min[f];
      return range === 0 ? 0.5 : (val - min[f]) / range;
    })
  );

  return { scaled, min, max };
}

/**
 * Standardize dataset using Z-Score normalization (mean = 0, std = 1)
 * @param {number[][]} X Raw feature matrix
 * @returns {{ scaled: number[][], mean: number[], std: number[] }}
 */
function zScoreScale(X) {
  if (!X || X.length === 0) return { scaled: [], mean: [], std: [] };
  const n = X.length;
  const numFeatures = X[0].length;
  const mean = new Array(numFeatures).fill(0);
  const std = new Array(numFeatures).fill(0);

  // Compute means
  for (let i = 0; i < n; i++) {
    for (let f = 0; f < numFeatures; f++) {
      mean[f] += X[i][f];
    }
  }
  for (let f = 0; f < numFeatures; f++) {
    mean[f] /= n;
  }

  // Compute standard deviations
  for (let i = 0; i < n; i++) {
    for (let f = 0; f < numFeatures; f++) {
      const diff = X[i][f] - mean[f];
      std[f] += diff * diff;
    }
  }
  for (let f = 0; f < numFeatures; f++) {
    std[f] = Math.sqrt(std[f] / n) || 1e-6; // prevent zero division
  }

  const scaled = X.map((row) =>
    row.map((val, f) => (val - mean[f]) / std[f])
  );

  return { scaled, mean, std };
}

/**
 * K-Means++ Centroid Initialization
 * Chooses initial centroids with probability proportional to squared distance from existing centroids.
 * @param {number[][]} X Data points
 * @param {number} k Number of clusters
 * @param {number[]} [weights] Optional feature weights
 * @returns {number[][]} Initial centroids
 */
function initializeCentroidsKMeansPlusPlus(X, k, weights = null) {
  const n = X.length;
  const centroids = [];

  // 1. Choose first centroid uniformly at random
  const firstIndex = Math.floor(Math.random() * n);
  centroids.push([...X[firstIndex]]);

  // 2. Choose remaining k - 1 centroids
  for (let c = 1; c < k; c++) {
    const distancesSq = new Array(n);
    let totalDistSq = 0;

    for (let i = 0; i < n; i++) {
      // Find distance to closest centroid chosen so far
      let minDist = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const d = euclideanDistance(X[i], centroids[j], weights);
        if (d < minDist) minDist = d;
      }
      const dSq = minDist * minDist;
      distancesSq[i] = dSq;
      totalDistSq += dSq;
    }

    // Weighted random selection
    if (totalDistSq === 0) {
      // Fallback: pick another distinct point
      centroids.push([...X[(firstIndex + c) % n]]);
      continue;
    }

    const randVal = Math.random() * totalDistSq;
    let cumulative = 0;
    let selectedIdx = n - 1;

    for (let i = 0; i < n; i++) {
      cumulative += distancesSq[i];
      if (cumulative >= randVal) {
        selectedIdx = i;
        break;
      }
    }

    centroids.push([...X[selectedIdx]]);
  }

  return centroids;
}

class KMeans {
  /**
   * @param {Object} options
   * @param {number} [options.k=4] Number of clusters
   * @param {number} [options.maxIterations=100] Maximum iterations
   * @param {number} [options.tolerance=1e-4] Convergence tolerance for centroid movement
   * @param {string} [options.normalization='minmax'] 'minmax' | 'zscore' | 'none'
   * @param {number[]} [options.weights] Feature weights
   * @param {number} [options.randomState=null] Optional seed (for determinism if needed)
   */
  constructor({
    k = 4,
    maxIterations = 100,
    tolerance = 1e-4,
    normalization = 'minmax',
    weights = null,
  } = {}) {
    this.k = Math.max(1, k);
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
    this.normalization = normalization;
    this.weights = weights;

    this.centroids = []; // Centroids in scaled space
    this.centroidsRaw = []; // Centroids denormalized to raw feature space
    this.labels = []; // Cluster assignment per data point
    this.inertia = 0; // Within-Cluster Sum of Squares (WCSS)
    this.silhouetteScore = null;
    this.featureNames = [];
    this.normMeta = null;
    this.iterationsRun = 0;
    this.converged = false;
  }

  /**
   * Fit K-Means on dataset X
   * @param {number[][]} X Raw feature matrix [numSamples, numFeatures]
   * @param {string[]} [featureNames]
   * @returns {KMeans}
   */
  fit(X, featureNames = []) {
    if (!X || X.length === 0) {
      throw new Error('KMeans.fit: input dataset is empty');
    }

    const n = X.length;
    const numFeatures = X[0].length;
    this.featureNames = featureNames.length === numFeatures 
      ? featureNames 
      : Array.from({ length: numFeatures }, (_, i) => `f${i}`);

    const actualK = Math.min(this.k, n);

    // Apply normalization
    let scaledX = X;
    if (this.normalization === 'minmax') {
      this.normMeta = minMaxScale(X);
      scaledX = this.normMeta.scaled;
    } else if (this.normalization === 'zscore') {
      this.normMeta = zScoreScale(X);
      scaledX = this.normMeta.scaled;
    }

    // 1. Initialize Centroids using K-Means++
    let centroids = initializeCentroidsKMeansPlusPlus(scaledX, actualK, this.weights);
    let labels = new Array(n).fill(0);
    let iterations = 0;
    let converged = false;

    // 2. Iteration Loop (Lloyd's Algorithm)
    for (; iterations < this.maxIterations; iterations++) {
      // Step A: Assignment
      let assignmentsChanged = false;
      for (let i = 0; i < n; i++) {
        let minDistance = Infinity;
        let bestCluster = 0;

        for (let c = 0; c < actualK; c++) {
          const dist = euclideanDistance(scaledX[i], centroids[c], this.weights);
          if (dist < minDistance) {
            minDistance = dist;
            bestCluster = c;
          }
        }

        if (labels[i] !== bestCluster) {
          assignmentsChanged = true;
          labels[i] = bestCluster;
        }
      }

      // Step B: Update Centroids
      const newCentroids = Array.from({ length: actualK }, () => new Array(numFeatures).fill(0));
      const counts = new Array(actualK).fill(0);

      for (let i = 0; i < n; i++) {
        const cluster = labels[i];
        counts[cluster]++;
        for (let f = 0; f < numFeatures; f++) {
          newCentroids[cluster][f] += scaledX[i][f];
        }
      }

      // Compute averages & handle empty clusters
      let maxCentroidShift = 0;
      for (let c = 0; c < actualK; c++) {
        if (counts[c] > 0) {
          for (let f = 0; f < numFeatures; f++) {
            newCentroids[c][f] /= counts[c];
          }
        } else {
          // Re-seed empty cluster with the sample farthest from any centroid
          let maxDist = -Infinity;
          let farthestSampleIdx = 0;
          for (let i = 0; i < n; i++) {
            let dClosest = Infinity;
            for (let j = 0; j < actualK; j++) {
              const d = euclideanDistance(scaledX[i], centroids[j], this.weights);
              if (d < dClosest) dClosest = d;
            }
            if (dClosest > maxDist) {
              maxDist = dClosest;
              farthestSampleIdx = i;
            }
          }
          newCentroids[c] = [...scaledX[farthestSampleIdx]];
        }

        // Measure centroid displacement
        const shift = euclideanDistance(centroids[c], newCentroids[c], this.weights);
        if (shift > maxCentroidShift) {
          maxCentroidShift = shift;
        }
      }

      centroids = newCentroids;

      // Check convergence criteria
      if (!assignmentsChanged || maxCentroidShift <= this.tolerance) {
        converged = true;
        break;
      }
    }

    this.centroids = centroids;
    this.labels = labels;
    this.iterationsRun = iterations + 1;
    this.converged = converged;

    // 3. Compute Inertia / WCSS
    this.inertia = this._calculateInertia(scaledX, centroids, labels);

    // 4. Denormalize centroids back to original feature scale for human interpretation
    this.centroidsRaw = this._denormalizeCentroids(centroids);

    // 5. Compute Silhouette Score
    this.silhouetteScore = this._calculateSilhouetteScore(scaledX, labels, actualK);

    return this;
  }

  /**
   * Predict cluster assignments for new or existing samples
   * @param {number[][]} X Samples in raw feature space
   * @returns {number[]} Assigned cluster index per sample
   */
  predict(X) {
    let scaled = X;
    if (this.normalization === 'minmax' && this.normMeta) {
      const { min, max } = this.normMeta;
      scaled = X.map((row) =>
        row.map((val, f) => {
          const range = max[f] - min[f];
          return range === 0 ? 0.5 : (val - min[f]) / range;
        })
      );
    } else if (this.normalization === 'zscore' && this.normMeta) {
      const { mean, std } = this.normMeta;
      scaled = X.map((row) =>
        row.map((val, f) => (val - mean[f]) / std[f])
      );
    }

    return scaled.map((sample) => {
      let minDist = Infinity;
      let cluster = 0;
      for (let c = 0; c < this.centroids.length; c++) {
        const d = euclideanDistance(sample, this.centroids[c], this.weights);
        if (d < minDist) {
          minDist = d;
          cluster = c;
        }
      }
      return cluster;
    });
  }

  /**
   * Calculate Inertia (Within-Cluster Sum of Squares)
   */
  _calculateInertia(scaledX, centroids, labels) {
    let sum = 0;
    for (let i = 0; i < scaledX.length; i++) {
      const c = labels[i];
      const d = euclideanDistance(scaledX[i], centroids[c], this.weights);
      sum += d * d;
    }
    return sum;
  }

  /**
   * Denormalize centroids back into raw scale
   */
  _denormalizeCentroids(centroids) {
    if (!this.normMeta) return centroids.map((c) => [...c]);

    if (this.normalization === 'minmax') {
      const { min, max } = this.normMeta;
      return centroids.map((c) =>
        c.map((val, f) => min[f] + val * (max[f] - min[f]))
      );
    }

    if (this.normalization === 'zscore') {
      const { mean, std } = this.normMeta;
      return centroids.map((c) =>
        c.map((val, f) => mean[f] + val * std[f])
      );
    }

    return centroids.map((c) => [...c]);
  }

  /**
   * Compute Mean Silhouette Score
   * s(i) = (b(i) - a(i)) / max(a(i), b(i))
   * where a(i) is mean distance to other points in the same cluster,
   * and b(i) is minimum mean distance to points in any other cluster.
   */
  _calculateSilhouetteScore(scaledX, labels, k) {
    const n = scaledX.length;
    if (k <= 1 || n <= k) return 0;

    // Pre-group indices by cluster
    const clusterIndices = Array.from({ length: k }, () => []);
    for (let i = 0; i < n; i++) {
      clusterIndices[labels[i]].push(i);
    }

    let totalSilhouette = 0;
    let evaluatedCount = 0;

    for (let i = 0; i < n; i++) {
      const ownCluster = labels[i];
      const ownIndices = clusterIndices[ownCluster];

      // If cluster has only 1 point, silhouette is defined as 0
      if (ownIndices.length <= 1) {
        continue;
      }

      // Compute a(i): average distance to own cluster
      let aSum = 0;
      for (const j of ownIndices) {
        if (i !== j) {
          aSum += euclideanDistance(scaledX[i], scaledX[j], this.weights);
        }
      }
      const a = aSum / (ownIndices.length - 1);

      // Compute b(i): min average distance to another cluster
      let bMin = Infinity;
      for (let c = 0; c < k; c++) {
        if (c === ownCluster || clusterIndices[c].length === 0) continue;
        let otherSum = 0;
        for (const j of clusterIndices[c]) {
          otherSum += euclideanDistance(scaledX[i], scaledX[j], this.weights);
        }
        const otherAvg = otherSum / clusterIndices[c].length;
        if (otherAvg < bMin) {
          bMin = otherAvg;
        }
      }

      const denom = Math.max(a, bMin);
      const s = denom === 0 ? 0 : (bMin - a) / denom;
      totalSilhouette += s;
      evaluatedCount++;
    }

    return evaluatedCount > 0 ? parseFloat((totalSilhouette / evaluatedCount).toFixed(4)) : 0;
  }
}

/**
 * Compute Elbow Curve & Silhouette Profile across K in [minK, maxK]
 * @param {number[][]} X Raw feature matrix
 * @param {Object} options
 * @returns {Array<{ k: number, inertia: number, silhouetteScore: number }>}
 */
function computeElbowCurve(X, { minK = 2, maxK = 6, normalization = 'minmax', weights = null } = {}) {
  const results = [];
  const upperK = Math.min(maxK, Math.max(2, X.length - 1));

  for (let k = minK; k <= upperK; k++) {
    const km = new KMeans({ k, maxIterations: 60, normalization, weights });
    km.fit(X);
    results.push({
      k,
      inertia: parseFloat(km.inertia.toFixed(2)),
      silhouetteScore: km.silhouetteScore,
    });
  }

  return results;
}

module.exports = {
  KMeans,
  euclideanDistance,
  minMaxScale,
  zScoreScale,
  computeElbowCurve,
};
