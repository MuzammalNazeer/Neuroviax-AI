const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const {
  listSuppliers, createSupplier, updateSupplier, compareSuppliers,
} = require('../controllers/supplierController');

router.use(protect, requireBusinessContext);

router.get('/', listSuppliers);
router.get('/compare', compareSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

module.exports = router;
