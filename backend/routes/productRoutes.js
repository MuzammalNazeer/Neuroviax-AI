const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');

router.use(protect, requireBusinessContext);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', allowRoles('owner', 'admin', 'manager'), createProduct);
router.put('/:id', allowRoles('owner', 'admin', 'manager'), updateProduct);
router.delete('/:id', allowRoles('owner', 'admin'), deleteProduct);

module.exports = router;
