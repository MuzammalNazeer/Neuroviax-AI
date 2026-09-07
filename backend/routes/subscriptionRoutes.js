const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlans,
  createCheckoutSession,
  getMySubscription,
  cancelSubscription,
  reactivateSubscription,
  createPortalSession,
  getAdminAnalytics,
  devActivatePlan,
} = require('../controllers/subscriptionController');

// Public route to view plan specs & pricing
router.get('/plans', getPlans);

// Protected user subscription routes
router.use(protect);

router.post('/checkout', createCheckoutSession);
router.get('/me', getMySubscription);
router.post('/cancel', cancelSubscription);
router.post('/reactivate', reactivateSubscription);
router.post('/portal', createPortalSession);
router.get('/admin/analytics', getAdminAnalytics);

// Dev / test simulation helper
router.post('/dev-activate', devActivatePlan);

module.exports = router;
