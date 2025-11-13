/**
 * Role-based access control middleware
 * Restricts route access to specific user roles
 */

exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is restricted to: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
