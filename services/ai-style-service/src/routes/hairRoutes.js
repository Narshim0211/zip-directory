const express = require('express');
const multer = require('multer');
const { verifyInternalAuth } = require('../middleware/verifyInternalAuth');
const { rateLimitPerUser } = require('../middleware/rateLimitPerUser');
const asyncWrapper = require('../middleware/asyncWrapper');
const { AppError } = require('../middleware/errorHandler');
const hairService = require('../services/hairService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/hair-tryon',
  verifyInternalAuth,
  rateLimitPerUser('visual'),
  upload.single('photo'),
  asyncWrapper(async (req, res) => {
    if (!req.file) {
      throw new AppError('AI_INPUT_PHOTO_REQUIRED', 'A selfie is required for hair try-on', 400);
    }

    const { styleId } = req.body;
    if (!styleId) {
      throw new AppError('AI_STYLE_ID_REQUIRED', 'Please select a hairstyle', 400);
    }

    const result = await hairService.generate({
      userId: req.userContext.userId,
      styleId,
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    res.json({
      success: true,
      ...result,
    });
  })
);

module.exports = router;
