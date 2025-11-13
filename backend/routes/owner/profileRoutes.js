const express = require('express');
const router = express.Router();
const protectOwner = require('../../middleWare/authOwnerMiddleware');
const { asyncHandler } = require('../../modules/shared/utils/errorHandler');
const ownerService = require('../../services/owner/ownerProfileService');

// All routes require owner auth
router.use(protectOwner);

// GET /api/owner/profile/me
router.get('/me', asyncHandler(async (req, res) => {
  const profile = await ownerService.ensureProfileForUser(req.user);
  res.json({ success: true, data: profile });
}));

// PUT /api/owner/profile/me
router.put('/me', asyncHandler(async (req, res) => {
  const updated = await ownerService.updateProfile(req.user._id || req.user.id, req.body || {});
  res.json({ success: true, data: updated });
}));

// GET /api/owner/profile/handle/:handle
router.get('/handle/:handle', asyncHandler(async (req, res) => {
  const profile = await ownerService.getBySlug(req.params.handle);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: profile });
}));

module.exports = router;
