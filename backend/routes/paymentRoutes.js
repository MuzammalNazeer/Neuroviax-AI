const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  listPayments,
  createPayment,
  markPaymentCompleted,
  cashFlowSnapshot,
  cashFlowPrediction,
  verifyAccount,
  createStripeCheckoutSession,
  verifyStripePayment,
} = require('../controllers/paymentController');

router.use(protect, requireBusinessContext);

router.get('/', listPayments);
router.get('/cash-flow', cashFlowSnapshot);
router.get('/cash-flow-prediction', cashFlowPrediction);
router.post('/verify-account', verifyAccount);
router.post('/create-stripe-checkout', createStripeCheckoutSession);
router.post('/verify-stripe-payment', verifyStripePayment);
router.post('/', allowRoles('owner', 'admin', 'accountant'), createPayment);
router.patch('/:id/complete', allowRoles('owner', 'admin', 'accountant'), markPaymentCompleted);

module.exports = router;
