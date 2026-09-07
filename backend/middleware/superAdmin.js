/**
 * Super Admin Authorization Middleware
 * Strictly grants access only to Muzammal Nazeer (nazeermuzammal174@gmail.com)
 * or accounts flagged with isSuperAdmin: true.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userEmail = (req.user.email || '').toLowerCase().trim();
  const isSuper = Boolean(
    req.user.isSuperAdmin ||
    userEmail === 'nazeermuzammal174@gmail.com'
  );

  if (!isSuper) {
    return res.status(403).json({
      message: 'Access Denied: Super Admin privileges are restricted exclusively to Muzammal Nazeer.',
    });
  }

  next();
};

module.exports = { requireSuperAdmin };
