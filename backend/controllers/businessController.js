const asyncHandler = require('../utils/asyncHandler');
const Business = require('../models/Business');
const Branch = require('../models/Branch');
const User = require('../models/User');
const { logAction } = require('../utils/audit');

const getBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.businessId);
  if (!business) return res.status(404).json({ message: 'Business not found' });
  res.json(business);
});

const updateBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findByIdAndUpdate(req.businessId, req.body, {
    new: true,
    runValidators: true,
  });
  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'business.updated',
    entityType: 'Business',
    entityId: business._id,
  });
  res.json(business);
});

const listBranches = asyncHandler(async (req, res) => {
  let branches = await Branch.find({ business: req.businessId });
  if (!branches || branches.length === 0) {
    const defaultBranch = await Branch.create({
      business: req.businessId,
      name: 'Main Branch',
      type: 'both',
    });
    branches = [defaultBranch];
  }
  res.json(branches);
});

const createBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.create({ ...req.body, business: req.businessId });
  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'branch.created',
    entityType: 'Branch',
    entityId: branch._id,
  });
  res.status(201).json(branch);
});

const listMembers = asyncHandler(async (req, res) => {
  const users = await User.find({
    'memberships.business': req.businessId,
  }).select('-resetPasswordOTP -resetPasswordOTPExpiry');

  const members = users.map((u) => {
    const membership = u.memberships.find(
      (m) =>
        (m.business?._id ? m.business._id.toString() : m.business?.toString()) ===
        req.businessId.toString()
    );
    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      role: membership?.role || 'staff',
    };
  });

  res.json(members);
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const validRoles = ['owner', 'admin', 'manager', 'staff', 'accountant'];
  if (!userId || !role || !validRoles.includes(role)) {
    return res.status(400).json({ message: 'userId and valid role are required' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const membership = user.memberships.find(
    (m) =>
      (m.business?._id ? m.business._id.toString() : m.business?.toString()) ===
      req.businessId.toString()
  );
  if (!membership) {
    return res.status(404).json({ message: 'User is not a member of this business' });
  }

  membership.role = role;
  await user.save();

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'member.role_updated',
    entityType: 'User',
    entityId: user._id,
    meta: { newRole: role },
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role,
  });
});

const addMember = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'staff' } = req.body;
  const validRoles = ['admin', 'manager', 'staff', 'accountant'];
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' });
  }
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const alreadyMember = existing.memberships.some(
      (m) =>
        (m.business?._id ? m.business._id.toString() : m.business?.toString()) ===
        req.businessId.toString()
    );
    if (alreadyMember) {
      return res.status(409).json({ message: 'This user is already a team member' });
    }
    existing.memberships.push({ business: req.businessId, role });
    await existing.save();
    return res.status(200).json({
      _id: existing._id,
      name: existing.name,
      email: existing.email,
      isActive: existing.isActive,
      role,
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    memberships: [{ business: req.businessId, role }],
  });

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: 'member.added',
    entityType: 'User',
    entityId: user._id,
    meta: { role },
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role,
  });
});

const toggleMemberActive = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const membership = user.memberships.find(
    (m) =>
      (m.business?._id ? m.business._id.toString() : m.business?.toString()) ===
      req.businessId.toString()
  );
  if (!membership) {
    return res.status(404).json({ message: 'User is not a member of this business' });
  }
  if (membership.role === 'owner') {
    return res.status(400).json({ message: 'Cannot deactivate the business owner' });
  }

  user.isActive = !user.isActive;
  await user.save();

  await logAction({
    business: req.businessId,
    actor: req.user._id,
    action: user.isActive ? 'member.activated' : 'member.deactivated',
    entityType: 'User',
    entityId: user._id,
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: membership.role,
  });
});

module.exports = {
  getBusiness,
  updateBusiness,
  listBranches,
  createBranch,
  listMembers,
  updateMemberRole,
  addMember,
  toggleMemberActive,
};
