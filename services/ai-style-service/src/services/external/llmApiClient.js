const axios = require('axios');
const { env } = require('../../config/env');

async function ask({ prompt }) {
  if (!env.externalApis.qa.baseUrl || !env.externalApis.qa.apiKey) {
    return 'Personalized advice is temporarily unavailable. Try updating your style profile for better results.';
  }

  const response = await axios.post(
    env.externalApis.qa.baseUrl,
    {
      model: env.externalApis.qa.model,
      messages: [
        { role: 'system', content: 'You are a cheerful beauty stylist.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 250,
    },
    {
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${env.externalApis.qa.apiKey}`,
      },
    }
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || 'No advice available right now.';
}

module.exports = { ask };
