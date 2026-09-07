const express = require('express');
const router = express.Router();
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} = require('../controllers/notificationController');
const { protect, requireBusinessContext } = require('../middleware/auth');

router.use(protect, requireBusinessContext);

router.get('/', listNotifications);
router.post('/', createNotification);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
