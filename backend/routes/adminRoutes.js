const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/superAdmin');
const {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllBusinesses,
  getAdminAuditLogs,
} = require('../controllers/adminController');

// All routes here strictly require authentication AND Super Admin privileges (Muzammal Nazeer only)
router.use(protect);
router.use(requireSuperAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/businesses', getAllBusinesses);
router.get('/audit-logs', getAdminAuditLogs);

module.exports = router;
