const express = require('express');
const multer = require('multer');
const { verifyInternalAuth } = require('../middleware/verifyInternalAuth');
const { rateLimitPerUser } = require('../middleware/rateLimitPerUser');
const asyncWrapper = require('../middleware/asyncWrapper');
const { AppError } = require('../middleware/errorHandler');
const outfitService = require('../services/outfitService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

router.post(
  '/outfit-tryon',
  verifyInternalAuth,
  rateLimitPerUser('visual'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'outfit', maxCount: 1 },
  ]),
  asyncWrapper(async (req, res) => {
    const basePhoto = req.files?.photo?.[0];
    const outfitImage = req.files?.outfit?.[0];
    const presetId = req.body?.presetId || null;

    if (!basePhoto) {
      throw new AppError('AI_BASE_PHOTO_REQUIRED', 'A body photo is required', 400);
    }

    if (!outfitImage && !presetId) {
      throw new AppError(
        'AI_OUTFIT_REQUIRED',
        'Upload an outfit image or choose a preset',
        400
      );
    }

    const result = await outfitService.generate({
      userId: req.userContext.userId,
      baseImage: basePhoto,
      outfitImage,
      presetId,
    });

    res.json({
      success: true,
      ...result,
    });
  })
);

module.exports = router;
