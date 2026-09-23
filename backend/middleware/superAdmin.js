const SUPER_ADMIN_EMAILS = [
  'nazeermuzammal174@gmail.com',
  'admin@neuroviax.ai',
  'nazirmuzammal281@gmail.com',
  'nazeermuzammal1744@gmail.com',
  'nazirmuzammal28@gmail.com',
];

const isMuzammalNazir = (user) => {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  const role = (user.role || '').toLowerCase();
  if (role === 'super_admin' || role === 'superadmin' || role === 'admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.includes(email);
};

/**
 * Super Admin Authorization Middleware
 * Grants access to platform administrators.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!isMuzammalNazir(req.user)) {
    return res.status(403).json({
      message: 'Access Denied: Super Admin console is strictly restricted to platform administrators.',
    });
  }

  next();
};

module.exports = { requireSuperAdmin, SUPER_ADMIN_EMAILS, isMuzammalNazir };

