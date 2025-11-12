const HANDLE_REGEX = /^[a-z0-9_-]{3,20}$/;

function validateOwnerUpdate(req, res, next) {
  const { firstName, lastName, handle, bio } = req.body || {};
  if (!firstName || !lastName) return res.status(400).json({ message: 'First and last name are required' });
  if (handle && !HANDLE_REGEX.test(handle)) return res.status(400).json({ message: 'Invalid handle format' });
  if (bio && String(bio).length > 280) return res.status(400).json({ message: 'Bio must be <= 280 characters' });
  return next();
}

function validateVisitorUpdate(req, res, next) {
  const { firstName, lastName, handle, bio } = req.body || {};
  if (!firstName || !lastName) return res.status(400).json({ message: 'First and last name are required' });
  if (handle && !HANDLE_REGEX.test(handle)) return res.status(400).json({ message: 'Invalid handle format' });
  if (bio && String(bio).length > 280) return res.status(400).json({ message: 'Bio must be <= 280 characters' });
  return next();
}

module.exports = { validateOwnerUpdate, validateVisitorUpdate };
