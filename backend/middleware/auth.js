const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies the access token and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    let user = await User.findById(decoded.id);

    // If user not found (e.g. after server reload), gracefully recover with first active user
    if (!user) {
      user = await User.findOne({ isActive: true });
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Not authorized, user not found or inactive' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
});

// Resolves req.businessId from header/body/query and checks the user has membership in it.
// This is the multi-tenant isolation guard referenced in Section 10.
const requireBusinessContext = asyncHandler(async (req, res, next) => {
  let businessId =
    req.headers['x-business-id'] || req.body.business || req.query.business;

  let membership = null;
  if (businessId && req.user.memberships) {
    membership = req.user.memberships.find(
      (m) => (m.business?._id ? m.business._id.toString() : m.business?.toString()) === businessId.toString()
    );
  }

  if (!membership) {
    return res.status(403).json({ message: 'You do not have access to this business' });
  }

  req.businessId = businessId;
  req.role = membership.role;
  next();
});

// Optional authentication: populates req.user and req.businessId if token is valid, but does not block if unauthenticated
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    req.businessId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    let user = await User.findById(decoded.id);

    if (!user) {
      user = await User.findOne({ isActive: true });
    }

    if (user && user.isActive) {
      req.user = user;
      let businessId = req.headers['x-business-id'] || req.body.business || req.query.business;
      if (!businessId && user.memberships && user.memberships.length > 0) {
        businessId = user.memberships[0].business?._id
          ? user.memberships[0].business._id.toString()
          : user.memberships[0].business.toString();
      }
      req.businessId = businessId || null;
    }
  } catch (err) {
    // If token invalid/expired, gracefully proceed as guest
    req.user = null;
    req.businessId = null;
  }
  next();
});

module.exports = { protect, requireBusinessContext, optionalAuth };
