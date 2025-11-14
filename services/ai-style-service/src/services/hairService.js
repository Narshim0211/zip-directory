const hairApiClient = require('./external/hairApiClient');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { env } = require('../config/env');

async function generate({ userId, styleId, imageBuffer, mimeType }) {
  try {
    const base64 = imageBuffer.toString('base64');
    const imageData = `data:${mimeType};base64,${base64}`;
    const response = await hairApiClient.generate({
      userId,
      styleId,
      imageData,
    });
    return {
      imageUrl: response.imageUrl || env.fallbackImage,
      vendorLatency: response.vendorLatency,
    };
  } catch (err) {
    logger.error('Hair try-on failed', { userId, error: err.message });
    throw new AppError(
      'AI_HAIR_TRYON_FAILED',
      "We couldn't generate this hairstyle. Try another photo or come back later.",
      502
    );
  }
}

module.exports = { generate };
