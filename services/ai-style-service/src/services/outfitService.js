const outfitApiClient = require('./external/outfitApiClient');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { env } = require('../config/env');

const PRESET_SCENES = {
  evening: '035',
  streetwear: '021',
  business: '017',
};

const toDataUri = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

const resolveSceneId = (presetId) => {
  const vendor = env.externalApis.xDesign;
  return (
    PRESET_SCENES[presetId] ||
    presetId || // allow direct vendor IDs
    vendor?.defaultSceneId ||
    '035'
  );
};

async function generate({ userId, baseImage, outfitImage, presetId }) {
  try {
    const payload = {
      userId,
      sceneId: resolveSceneId(presetId),
      baseImage: baseImage ? toDataUri(baseImage) : undefined,
      outfitImage: outfitImage ? toDataUri(outfitImage) : undefined,
    };
    const response = await outfitApiClient.generate(payload);
    return {
      imageUrl: response.imageUrl || env.fallbackImage,
      vendorLatency: response.vendorLatency,
    };
  } catch (err) {
    logger.error('Outfit try-on failed', { userId, error: err.message });
    throw new AppError(
      'AI_OUTFIT_TRYON_FAILED',
      'We could not render this outfit. Try a different photo or preset.',
      502
    );
  }
}

module.exports = { generate };
