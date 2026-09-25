'use strict';

/**
 * Neuroviax Machine Learning Core: Deep Autoencoder for Anomaly Detection
 * 
 * Unsupervised Neural Network designed to detect subtle, non-linear anomalies
 * in payments and orders via bottleneck reconstruction error.
 * 
 * Features built-in Z-Score Feature Standardization and Gradient Clipping.
 */

// Activation functions
function leakyRelu(x, alpha = 0.05) {
  return x > 0 ? x : alpha * x;
}

function leakyReluDeriv(x, alpha = 0.05) {
  return x > 0 ? 1 : alpha;
}

function clip(val, min = -5.0, max = 5.0) {
  return Math.min(max, Math.max(min, val));
}

// Xavier/Glorot uniform initialization
function randomWeight(fanIn, fanOut) {
  const limit = Math.sqrt(6 / (fanIn + fanOut));
  return (Math.random() * 2 - 1) * limit;
}

class Autoencoder {
  constructor({
    inputDim = 6,
    hiddenDim = 16,
    latentDim = 4,
    learningRate = 0.01,
    epochs = 40,
  } = {}) {
    this.inputDim = inputDim;
    this.hiddenDim = Math.max(hiddenDim, inputDim * 2);
    this.latentDim = Math.max(2, Math.min(latentDim, Math.floor(inputDim / 2) || 2));
    this.learningRate = learningRate;
    this.epochs = epochs;

    this.trained = false;
    this.meanLoss = 0.05;
    this.stdLoss = 0.05;

    // Standardization params
    this.means = [];
    this.stds = [];

    // Weights & Biases
    this.W1 = this._initMatrix(this.inputDim, this.hiddenDim);
    this.b1 = new Array(this.hiddenDim).fill(0);

    this.W2 = this._initMatrix(this.hiddenDim, this.latentDim);
    this.b2 = new Array(this.latentDim).fill(0);

    this.W3 = this._initMatrix(this.latentDim, this.hiddenDim);
    this.b3 = new Array(this.hiddenDim).fill(0);

    this.W4 = this._initMatrix(this.hiddenDim, this.inputDim);
    this.b4 = new Array(this.inputDim).fill(0);
  }

  _initMatrix(rows, cols) {
    const mat = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(randomWeight(rows, cols));
      }
      mat.push(row);
    }
    return mat;
  }

  /**
   * Standardize input vector using learned dataset statistics
   */
  standardize(x) {
    if (!this.means.length) return x.slice();
    return x.map((val, j) => {
      const std = this.stds[j] || 1;
      return clip((val - this.means[j]) / std, -10, 10);
    });
  }

  /**
   * Forward pass: x (standardized) -> z (latent) -> x̂ (reconstruction)
   */
  forward(xNorm) {
    // 1. Hidden 1
    const h1Pre = new Array(this.hiddenDim).fill(0);
    const h1 = new Array(this.hiddenDim).fill(0);
    for (let j = 0; j < this.hiddenDim; j++) {
      let sum = this.b1[j];
      for (let i = 0; i < this.inputDim; i++) {
        sum += xNorm[i] * this.W1[i][j];
      }
      h1Pre[j] = sum;
      h1[j] = leakyRelu(sum);
    }

    // 2. Latent bottleneck
    const zPre = new Array(this.latentDim).fill(0);
    const z = new Array(this.latentDim).fill(0);
    for (let j = 0; j < this.latentDim; j++) {
      let sum = this.b2[j];
      for (let i = 0; i < this.hiddenDim; i++) {
        sum += h1[i] * this.W2[i][j];
      }
      zPre[j] = sum;
      z[j] = leakyRelu(sum);
    }

    // 3. Hidden 2 (Decoder)
    const h2Pre = new Array(this.hiddenDim).fill(0);
    const h2 = new Array(this.hiddenDim).fill(0);
    for (let j = 0; j < this.hiddenDim; j++) {
      let sum = this.b3[j];
      for (let i = 0; i < this.latentDim; i++) {
        sum += z[i] * this.W3[i][j];
      }
      h2Pre[j] = sum;
      h2[j] = leakyRelu(sum);
    }

    // 4. Output Reconstruction
    const xHat = new Array(this.inputDim).fill(0);
    for (let j = 0; j < this.inputDim; j++) {
      let sum = this.b4[j];
      for (let i = 0; i < this.hiddenDim; i++) {
        sum += h2[i] * this.W4[i][j];
      }
      xHat[j] = sum;
    }

    return { h1Pre, h1, zPre, z, h2Pre, h2, xHat };
  }

  /**
   * Train autoencoder on a dataset of feature vectors
   */
  fit(X) {
    if (!X || X.length === 0) return;
    const n = X.length;
    const d = X[0].length;
    this.inputDim = d;
    this.hiddenDim = Math.max(16, d * 2);
    this.latentDim = Math.max(2, Math.min(4, Math.floor(d / 2) || 2));

    // Re-initialize weights with correct dimensions
    this.W1 = this._initMatrix(this.inputDim, this.hiddenDim);
    this.b1 = new Array(this.hiddenDim).fill(0);
    this.W2 = this._initMatrix(this.hiddenDim, this.latentDim);
    this.b2 = new Array(this.latentDim).fill(0);
    this.W3 = this._initMatrix(this.latentDim, this.hiddenDim);
    this.b3 = new Array(this.hiddenDim).fill(0);
    this.W4 = this._initMatrix(this.hiddenDim, this.inputDim);
    this.b4 = new Array(this.inputDim).fill(0);

    // Compute feature means and standard deviations
    this.means = new Array(d).fill(0);
    this.stds = new Array(d).fill(1);
    for (let j = 0; j < d; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += X[i][j];
      this.means[j] = sum / n;
      let varSum = 0;
      for (let i = 0; i < n; i++) varSum += Math.pow(X[i][j] - this.means[j], 2);
      this.stds[j] = Math.sqrt(varSum / n) || 1;
    }

    const XNorm = X.map((row) => this.standardize(row));

    // Train loop with gradient clipping
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        const x = XNorm[i];
        const { h1Pre, h1, zPre, z, h2Pre, h2, xHat } = this.forward(x);

        // Output error gradient
        const dOut = new Array(this.inputDim);
        for (let j = 0; j < this.inputDim; j++) {
          dOut[j] = clip((2 * (xHat[j] - x[j])) / this.inputDim, -2.0, 2.0);
        }

        // Backprop to Layer 4 (W4, b4)
        const dH2 = new Array(this.hiddenDim).fill(0);
        for (let j = 0; j < this.inputDim; j++) {
          this.b4[j] -= this.learningRate * dOut[j];
          for (let k = 0; k < this.hiddenDim; k++) {
            dH2[k] += dOut[j] * this.W4[k][j];
            this.W4[k][j] -= this.learningRate * clip(dOut[j] * h2[k], -2.0, 2.0);
          }
        }

        // Activation deriv for h2
        for (let k = 0; k < this.hiddenDim; k++) {
          dH2[k] = clip(dH2[k] * leakyReluDeriv(h2Pre[k]), -2.0, 2.0);
        }

        // Backprop to Layer 3 (W3, b3)
        const dZ = new Array(this.latentDim).fill(0);
        for (let j = 0; j < this.hiddenDim; j++) {
          this.b3[j] -= this.learningRate * dH2[j];
          for (let k = 0; k < this.latentDim; k++) {
            dZ[k] += dH2[j] * this.W3[k][j];
            this.W3[k][j] -= this.learningRate * clip(dH2[j] * z[k], -2.0, 2.0);
          }
        }

        // Activation deriv for z
        for (let k = 0; k < this.latentDim; k++) {
          dZ[k] = clip(dZ[k] * leakyReluDeriv(zPre[k]), -2.0, 2.0);
        }

        // Backprop to Layer 2 (W2, b2)
        const dH1 = new Array(this.hiddenDim).fill(0);
        for (let j = 0; j < this.latentDim; j++) {
          this.b2[j] -= this.learningRate * dZ[j];
          for (let k = 0; k < this.hiddenDim; k++) {
            dH1[k] += dZ[j] * this.W2[k][j];
            this.W2[k][j] -= this.learningRate * clip(dZ[j] * h1[k], -2.0, 2.0);
          }
        }

        // Activation deriv for h1
        for (let k = 0; k < this.hiddenDim; k++) {
          dH1[k] = clip(dH1[k] * leakyReluDeriv(h1Pre[k]), -2.0, 2.0);
        }

        // Backprop to Layer 1 (W1, b1)
        for (let j = 0; j < this.hiddenDim; j++) {
          this.b1[j] -= this.learningRate * dH1[j];
          for (let k = 0; k < this.inputDim; k++) {
            this.W1[k][j] -= this.learningRate * clip(dH1[j] * x[k], -2.0, 2.0);
          }
        }
      }
    }

    // Baseline distribution of reconstruction MSE on training samples
    const losses = XNorm.map((xNorm) => {
      const { xHat } = this.forward(xNorm);
      let sumSq = 0;
      for (let j = 0; j < this.inputDim; j++) {
        sumSq += Math.pow(xNorm[j] - xHat[j], 2);
      }
      return sumSq / this.inputDim;
    });

    const sum = losses.reduce((a, b) => a + b, 0);
    this.meanLoss = sum / losses.length || 0.05;
    const variance = losses.reduce((acc, l) => acc + Math.pow(l - this.meanLoss, 2), 0) / losses.length;
    this.stdLoss = Math.sqrt(variance) || 0.05;

    this.trained = true;
  }

  /**
   * Calculate reconstruction error (MSE)
   */
  reconstructionError(xRaw) {
    const xNorm = this.standardize(xRaw);
    const { xHat } = this.forward(xNorm);
    const featureErrors = [];
    let sumSquaredError = 0;

    for (let j = 0; j < this.inputDim; j++) {
      const err = Math.pow(xNorm[j] - xHat[j], 2);
      sumSquaredError += err;
      featureErrors.push({
        featureIdx: j,
        error: parseFloat(err.toFixed(4)),
        original: parseFloat(xNorm[j].toFixed(3)),
        reconstructed: parseFloat(xHat[j].toFixed(3)),
      });
    }

    const mse = sumSquaredError / this.inputDim;
    return {
      mse: parseFloat(mse.toFixed(4)),
      featureErrors,
    };
  }

  /**
   * Predict anomaly score normalized to [0.01, 0.99]
   */
  score(xRaw) {
    const { mse, featureErrors } = this.reconstructionError(xRaw);
    const k = 2.0 * Math.max(0.01, this.meanLoss);
    // Strictly increasing Hill saturation: mse / (mse + 2 * meanLoss)
    // When mse == meanLoss, score = 1/3 ≈ 0.33 (Normal baseline)
    // When mse == 3 * meanLoss, score = 3/5 = 0.60 (Elevated)
    // When mse == 8 * meanLoss, score = 8/10 = 0.80 (High)
    // When mse == 20 * meanLoss, score = 20/22 = 0.91 (Critical)
    const anomalyScore = mse / (mse + k);

    return {
      anomalyScore: Math.min(0.99, Math.max(0.01, parseFloat(anomalyScore.toFixed(4)))),
      reconstructionMse: mse,
      ratio: parseFloat((mse / Math.max(0.001, this.meanLoss)).toFixed(2)),
      featureErrors,
    };
  }
}

/**
 * Hybrid Ensemble score combination
 */
function computeHybridScore(iForestScore, autoencoderScore, wForest = 0.5, wAuto = 0.5) {
  const score = wForest * iForestScore + wAuto * autoencoderScore;
  return Math.min(0.99, Math.max(0.01, parseFloat(score.toFixed(4))));
}

module.exports = {
  Autoencoder,
  computeHybridScore,
};
