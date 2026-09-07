const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

// @desc  List notifications for current business/user
// @route GET /api/notifications
const listNotifications = asyncHandler(async (req, res) => {
  const { channel, type, status } = req.query;
  const filter = { business: req.businessId };
  if (channel) filter.channel = channel;
  if (type) filter.type = type;
  if (status) filter.status = status;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    business: req.businessId,
    status: 'unread',
  });

  res.json({
    notifications,
    unreadCount,
  });
});

// @desc  Mark a notification as read
// @route PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    { status: 'read', readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json(notification);
});

// @desc  Mark all notifications as read
// @route PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { business: req.businessId, status: 'unread' },
    { status: 'read', readAt: new Date() }
  );

  res.json({ message: 'All notifications marked as read' });
});

// @desc  Create a notification (internal helper or API)
// @route POST /api/notifications
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, channel, metadata } = req.body;

  const notification = await Notification.create({
    business: req.businessId,
    user: req.user?._id,
    title,
    message,
    type: type || 'system',
    channel: channel || 'in_app',
    status: 'unread',
    metadata: metadata || {},
  });

  res.status(201).json(notification);
});

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
