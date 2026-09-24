const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { listCustomers, createCustomer, updateCustomer, toggleWhatsAppOptIn } = require('../controllers/customerController');

router.use(protect, requireBusinessContext);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.patch('/:id/toggle-whatsapp', toggleWhatsAppOptIn);

module.exports = router;
