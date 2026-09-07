const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { listCustomers, createCustomer, updateCustomer } = require('../controllers/customerController');

router.use(protect, requireBusinessContext);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

module.exports = router;
