const express = require('express');
const router = express.Router();
const {
  getLiveReport,
  listSavedReports,
  saveReportSnapshot,
} = require('../controllers/reportController');
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.use(protect, requireBusinessContext);

router.get('/:type/live', getLiveReport);
router.get('/', listSavedReports);
router.post('/generate', allowRoles('owner', 'admin', 'manager', 'accountant'), saveReportSnapshot);

module.exports = router;
