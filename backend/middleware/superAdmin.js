const SUPER_ADMIN_EMAILS = [
  'nazeermuzammal174@gmail.com',
];

const isMuzammalNazir = (user) => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  return email === 'nazeermuzammal174@gmail.com';
};

/**
 * Super Admin Authorization Middleware
 * Strictly grants access ONLY to platform creator Muzammal Nazir.
 * All other accounts are strictly denied access.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!isMuzammalNazir(req.user)) {
    return res.status(403).json({
      message: 'Access Denied: Super Admin console is strictly restricted to platform creator Muzammal Nazir.',
    });
  }

  next();
};

module.exports = { requireSuperAdmin, SUPER_ADMIN_EMAILS, isMuzammalNazir };

