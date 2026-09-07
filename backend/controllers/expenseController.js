const asyncHandler = require('../utils/asyncHandler');
const Expense = require('../models/Expense');
const { logAction } = require('../utils/audit');

// @desc  List all expenses for the current business
// @route GET /api/expenses
const listExpenses = asyncHandler(async (req, res) => {
  const { category, status } = req.query;
  const filter = { business: req.businessId };
  if (category) filter.category = category;
  if (status) filter.status = status;

  const expenses = await Expense.find(filter)
    .populate('branch', 'name')
    .populate('createdBy', 'name email')
    .sort({ date: -1, createdAt: -1 });

  res.json(expenses);
});

// @desc  Create a new expense entry
// @route POST /api/expenses
const createExpense = asyncHandler(async (req, res) => {
  const { title, category, amount, date, status, paymentMethod, notes, branch, reconciledOrder } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ message: 'Title and amount are required' });
  }

  const expense = await Expense.create({
    business: req.businessId,
    branch: branch || undefined,
    title,
    category: category || 'other',
    amount: Number(amount),
    date: date ? new Date(date) : new Date(),
    status: status || 'paid',
    paymentMethod: paymentMethod || 'cash',
    notes: notes || '',
    reconciledOrder: reconciledOrder || undefined,
    createdBy: req.user._id,
  });

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'expense.created',
    entityType: 'Expense',
    entityId: expense._id,
    metadata: { title: expense.title, amount: expense.amount, category: expense.category },
  });

  res.status(201).json(expense);
});

// @desc  Delete an expense entry
// @route DELETE /api/expenses/:id
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, business: req.businessId });
  if (!expense) {
    return res.status(404).json({ message: 'Expense record not found' });
  }

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'expense.deleted',
    entityType: 'Expense',
    entityId: expense._id,
    metadata: { title: expense.title, amount: expense.amount },
  });

  res.json({ message: 'Expense deleted successfully', id: req.params.id });
});

// @desc  Get aggregated expense summary by category for cash-flow analytics (FR-09)
// @route GET /api/expenses/summary
const getExpenseSummary = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ business: req.businessId });
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const byCategory = {};
  expenses.forEach((e) => {
    const cat = e.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + e.amount;
  });

  res.json({
    totalExpense,
    count: expenses.length,
    byCategory,
  });
});

module.exports = {
  listExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
};
