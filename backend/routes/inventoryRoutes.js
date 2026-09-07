const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { listInventory, recordMovement, lowStockAlerts } = require('../controllers/inventoryController');

router.use(protect, requireBusinessContext);

router.get('/', listInventory);
router.get('/low-stock', lowStockAlerts);
router.post('/movement', allowRoles('owner', 'admin', 'manager', 'staff'), recordMovement);

module.exports = router;
