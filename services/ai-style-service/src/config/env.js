const env = {
  port: Number(process.env.PORT || 6004),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/salonhub-ai-style',
  serviceName: process.env.SERVICE_NAME || 'ai-style-service',
  internalApiKey: process.env.INTERNAL_API_KEY || '',
  allowedCallers: process.env.ALLOWED_CALLERS
    ? process.env.ALLOWED_CALLERS.split(',').map((url) => url.trim())
    : '*',
  planDefaults: {
    visualMonthly: Number(process.env.VISUAL_MONTHLY_LIMIT || 100),
    visualDaily: Number(process.env.VISUAL_DAILY_LIMIT || 10),
    qaMonthly: Number(process.env.QA_MONTHLY_LIMIT || 200),
    perMinute: Number(process.env.PER_MINUTE_LIMIT || 5),
  },
  fallbackImage: process.env.FALLBACK_STYLE_IMAGE || 'https://placehold.co/600x800?text=Preview',
  externalApis: {
    hair: {
      baseUrl: process.env.HAIR_API_URL,
      apiKey: process.env.HAIR_API_KEY,
    },
    outfit: {
      baseUrl: process.env.OUTFIT_API_URL,
      apiKey: process.env.OUTFIT_API_KEY,
    },
    qa: {
      baseUrl: process.env.LLM_API_URL,
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
    },
    xDesign: {
      baseUrl: process.env.XDESIGN_API_BASE_URL,
      apiKey: process.env.XDESIGN_API_KEY,
      modelId: process.env.XDESIGN_MODEL_ID || '002',
      sceneType: process.env.XDESIGN_SCENE_TYPE || 'preset',
      defaultSceneId: process.env.XDESIGN_SCENE_ID || '035',
      pollIntervalMs: Number(process.env.XDESIGN_POLL_INTERVAL_MS || 4000),
      pollTimeoutMs: Number(process.env.XDESIGN_POLL_TIMEOUT_MS || 120000),
    },
  },
};

module.exports = { env };
