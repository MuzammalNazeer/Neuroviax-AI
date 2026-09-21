'use strict';

const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  getSegmentation,
  getSegmentationMetrics,
  dispatchSegmentAction,
} = require('../controllers/customerSegmentationController');

router.use(protect, requireBusinessContext);

// Real-time K-Means Customer Segmentation based on Purchase Behavior
router.get('/cluster', getSegmentation);
router.post('/cluster', getSegmentation);

// High-level segmentation metrics & distribution
router.get('/metrics', getSegmentationMetrics);

// Action triggers (WhatsApp campaigns, VIP discounts, re-engagement)
router.post('/action', allowRoles('owner', 'admin', 'manager'), dispatchSegmentAction);

// Default listing route
router.get('/', getSegmentation);

module.exports = router;
