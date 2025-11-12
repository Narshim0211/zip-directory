/**
 * requireProfileComplete(role)
 * Checks that req.user has a completed profile for the given role.
 * If profile missing or needsCompletion === true, returns 403 with message.
 */
module.exports = function requireProfileComplete(role) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      if (!role) return next();
      if (role === 'owner') {
        const svc = require('../services/owner/ownerProfileService');
        const p = await svc.ensureProfileForUser(req.user);
        if (!p || p.needsCompletion) return res.status(403).json({ message: 'Owner profile incomplete', profileIncomplete: true });
        return next();
      }
      if (role === 'visitor') {
        const svc = require('../services/visitor/visitorProfileService');
        const p = await svc.ensureProfileForUser(req.user);
        if (!p || p.needsCompletion) return res.status(403).json({ message: 'Visitor profile incomplete', profileIncomplete: true });
        return next();
      }
      return next();
    } catch (e) {
      console.error('requireProfileComplete error', e.message || e);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};
