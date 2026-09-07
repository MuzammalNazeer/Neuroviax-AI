const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { listOrders, getOrder, createOrder, updateOrderStatus } = require('../controllers/orderController');

router.use(protect, requireBusinessContext);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', allowRoles('owner', 'admin', 'manager', 'staff'), createOrder);
router.patch('/:id/status', allowRoles('owner', 'admin', 'manager'), updateOrderStatus);

module.exports = router;
