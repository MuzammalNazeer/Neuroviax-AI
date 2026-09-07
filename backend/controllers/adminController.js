const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Business = require('../models/Business');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// @desc    Get overall platform statistics for Super Admin dashboard
// @route   GET /api/admin/stats
// @access  Super Admin (Muzammal Nazeer only)
const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBusinesses, totalOrders, totalProducts, users] = await Promise.all([
    User.countDocuments ? User.countDocuments() : (await User.find()).length,
    Business.countDocuments ? Business.countDocuments() : (await Business.find()).length,
    Order.countDocuments ? Order.countDocuments() : (await Order.find()).length,
    Product.countDocuments ? Product.countDocuments() : (await Product.find()).length,
    User.find().select('createdAt lastLoginAt isActive'),
  ]);

  // Calculate active users in last 7 days and active user counts
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const activeRecently = users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= sevenDaysAgo).length;
  const activeAccounts = users.filter(u => u.isActive !== false).length;
  const suspendedAccounts = users.length - activeAccounts;

  // Aggregate orders gross value if available
  const orders = await Order.find().select('total status createdAt');
  const grossVolume = orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const fulfilledOrders = orders.filter(o => o.status === 'fulfilled').length;

  res.json({
    totalUsers,
    totalBusinesses,
    totalOrders,
    totalProducts,
    activeAccounts,
    suspendedAccounts,
    activeRecently,
    grossVolume,
    fulfilledOrders,
    systemStatus: 'Optimal',
    version: 'Production v1.0',
    adminIdentity: 'Muzammal Nazeer (Platform Super Admin)',
  });
});

// @desc    Get all registered users with business and activity details
// @route   GET /api/admin/users
// @access  Super Admin (Muzammal Nazeer only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });

  // Map user records and enrich with business details
  const businesses = await Business.find().select('name owner industry');
  const businessMap = {};
  businesses.forEach(b => {
    businessMap[b._id.toString()] = b;
  });

  const enrichedUsers = users.map(u => {
    const userObj = u.toObject ? u.toObject() : { ...u };
    let primaryBusiness = 'Independent';
    let primaryRole = 'user';

    if (userObj.memberships && userObj.memberships.length > 0) {
      const firstMembership = userObj.memberships[0];
      primaryRole = firstMembership.role || 'staff';
      const bizId = firstMembership.business?._id || firstMembership.business;
      if (bizId && businessMap[bizId.toString()]) {
        primaryBusiness = businessMap[bizId.toString()].name;
      }
    }

    const email = (userObj.email || '').toLowerCase();
    const isMuzammal = email === 'nazeermuzammal174@gmail.com' || Boolean(userObj.isSuperAdmin);

    return {
      _id: userObj._id,
      name: userObj.name,
      email: userObj.email,
      isActive: userObj.isActive !== false,
      isSuperAdmin: isMuzammal,
      role: isMuzammal ? 'SUPER_ADMIN' : primaryRole,
      businessName: primaryBusiness,
      currentPlan: userObj.currentPlan || 'FREE',
      subscriptionStatus: userObj.subscriptionStatus || 'active',
      createdAt: userObj.createdAt || new Date(),
      lastLoginAt: userObj.lastLoginAt || null,
    };
  });

  res.json(enrichedUsers);
});

// @desc    Toggle a user's active/suspended status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Super Admin (Muzammal Nazeer only)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent Super Admin from deactivating own account
  if (user.email.toLowerCase() === 'nazeermuzammal174@gmail.com' || user.isSuperAdmin) {
    return res.status(400).json({ message: 'Super Admin account cannot be deactivated' });
  }

  user.isActive = !user.isActive;
  await user.save();

  // Audit this administrative change
  await AuditLog.create({
    business: user.memberships?.[0]?.business || null,
    user: req.user._id,
    action: user.isActive ? 'user_activated' : 'user_suspended',
    resourceType: 'User',
    resourceId: user._id,
    details: `User status changed to ${user.isActive ? 'active' : 'suspended'} by Super Admin Muzammal Nazeer.`,
  });

  res.json({
    message: `User ${user.name} is now ${user.isActive ? 'active' : 'suspended'}`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
});

// @desc    Get all businesses registered on the platform
// @route   GET /api/admin/businesses
// @access  Super Admin (Muzammal Nazeer only)
const getAllBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find().populate('owner', 'name email').sort({ createdAt: -1 });
  res.json(businesses);
});

// @desc    Get platform-wide security audit and login logs
// @route   GET /api/admin/audit-logs
// @access  Super Admin (Muzammal Nazeer only)
const getAdminAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(logs);
});

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllBusinesses,
  getAdminAuditLogs,
};
