'use strict';

const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  detectAnomalies,
  getAnomalyMetrics,
  resolveAnomaly,
} = require('../controllers/anomalyController');

router.use(protect, requireBusinessContext);

// Real-time Isolation Forest Anomaly Detection
router.get('/detect', detectAnomalies);
router.post('/detect', detectAnomalies);

// Model telemetry & distribution metrics
router.get('/metrics', getAnomalyMetrics);

// Anomaly mitigation action resolution
router.post('/resolve', allowRoles('owner', 'admin', 'manager', 'accountant'), resolveAnomaly);

// Default listing route
router.get('/', detectAnomalies);

module.exports = router;
