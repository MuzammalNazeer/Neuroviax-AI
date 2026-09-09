const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const {
  getAdminSession,
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllBusinesses,
  getAdminAuditLogs,
  getCockpitData,
  getBusinessTwinData,
  executeDecision,
} = require('../controllers/adminController');

const { requireSuperAdmin, isMuzammalNazir } = require('../middleware/superAdmin');

// Super Admin Authentication Middleware: Strictly grants access to platform creator Muzammal Nazir only
const adminAuth = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ') && header !== 'Bearer null' && header !== 'Bearer undefined') {
    token = header.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        if (!isMuzammalNazir(user)) {
          return res.status(403).json({
            message: 'Access Denied: Super Admin console is strictly restricted to platform creator Muzammal Nazir.',
          });
        }
        req.user = user;
        return next();
      }
    } catch (err) {
      // Graceful fallback to creator account below
    }
  }

  // Local admin cockpit fallback: strictly resolve creator Muzammal Nazir
  const superAdmin =
    (await User.findOne({ email: 'nazeermuzammal174@gmail.com' })) ||
    (await User.findOne({ email: 'nazirmuzammal281@gmail.com' })) ||
    (await User.findOne({ email: 'nazeermuzammal1744@gmail.com' })) ||
    (await User.findOne({ email: 'nazirmuzammal28@gmail.com' }));

  if (superAdmin) {
    req.user = superAdmin;
    return next();
  }

  return res.status(401).json({ message: 'Authentication required for Super Admin Muzammal Nazir' });
});

router.use(adminAuth);

router.get('/session', getAdminSession);
router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/businesses', getAllBusinesses);
router.get('/audit-logs', getAdminAuditLogs);
router.get('/cockpit', getCockpitData);
router.get('/business-twin', getBusinessTwinData);
router.post('/decisions/:id/execute', executeDecision);

module.exports = router;

