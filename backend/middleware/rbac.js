// Role-Based Access Control: restricts module/data visibility by role (FR-13).
// Usage: router.post('/purchase-orders', protect, requireBusinessContext, allowRoles('owner','admin','manager'), handler)
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.role || !roles.includes(req.role)) {
    return res.status(403).json({ message: `Role '${req.role}' is not permitted to perform this action` });
  }
  next();
};

module.exports = { allowRoles };
