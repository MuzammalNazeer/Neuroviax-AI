const express = require('express');
const router = express.Router();
const {
  listExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.use(protect, requireBusinessContext);

router.get('/summary', getExpenseSummary);
router.get('/', listExpenses);
router.post('/', allowRoles('owner', 'admin', 'manager', 'accountant'), createExpense);
router.delete('/:id', allowRoles('owner', 'admin', 'manager'), deleteExpense);

module.exports = router;
