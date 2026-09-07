const express = require('express');
const router = express.Router();
const {
  listIntegrations,
  updateIntegration,
  testStripeConnection,
} = require('../controllers/integrationController');
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.use(protect, requireBusinessContext);

router.get('/', listIntegrations);
router.post('/test-stripe', allowRoles('owner', 'admin'), testStripeConnection);
router.put('/:provider', allowRoles('owner', 'admin'), updateIntegration);

module.exports = router;
