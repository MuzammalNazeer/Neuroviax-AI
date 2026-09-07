const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  generateRecommendations, listRecommendations, approveRecommendation, rejectRecommendation,
} = require('../controllers/aiController');

router.use(protect, requireBusinessContext);

router.post('/recommendations/generate', allowRoles('owner', 'admin', 'manager'), generateRecommendations);
router.get('/recommendations', listRecommendations);
router.patch('/recommendations/:id/approve', allowRoles('owner', 'admin', 'manager'), approveRecommendation);
router.patch('/recommendations/:id/reject', allowRoles('owner', 'admin', 'manager'), rejectRecommendation);

module.exports = router;
