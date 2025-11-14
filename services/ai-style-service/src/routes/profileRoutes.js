const express = require('express');
const { verifyInternalAuth } = require('../middleware/verifyInternalAuth');
const asyncWrapper = require('../middleware/asyncWrapper');
const profileService = require('../services/profileService');

const router = express.Router();

router.get(
  '/profile',
  verifyInternalAuth,
  asyncWrapper(async (req, res) => {
    const profile = await profileService.get(req.userContext.userId);
    res.json({
      success: true,
      profile,
    });
  })
);

router.post(
  '/profile',
  verifyInternalAuth,
  asyncWrapper(async (req, res) => {
    const profile = await profileService.upsert(req.userContext.userId, req.body || {});
    res.json({
      success: true,
      profile,
    });
  })
);

module.exports = router;
