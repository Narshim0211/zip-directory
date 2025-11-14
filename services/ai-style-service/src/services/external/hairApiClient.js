const axios = require('axios');
const { env } = require('../../config/env');

async function callVendor(payload) {
  if (!env.externalApis.hair.baseUrl || !env.externalApis.hair.apiKey) {
    return {
      imageUrl: env.fallbackImage,
      vendorLatency: 0,
      note: 'hair API not configured',
    };
  }

  const start = Date.now();
  const response = await axios.post(
    `${env.externalApis.hair.baseUrl}/generate`,
    {
      styleId: payload.styleId,
      image: payload.imageData,
    },
    {
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${env.externalApis.hair.apiKey}`,
      },
    }
  );
  return {
    imageUrl: response.data?.imageUrl,
    vendorLatency: Date.now() - start,
  };
}

module.exports = {
  generate: callVendor,
};
