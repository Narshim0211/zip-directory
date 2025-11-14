const profileService = require('./profileService');
const llmApiClient = require('./external/llmApiClient');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const buildPrompt = (question, profile) => {
  const contextLines = [];
  if (profile) {
    if (profile.hairType) contextLines.push(`Hair type: ${profile.hairType}`);
    if (profile.hairLength) contextLines.push(`Hair length: ${profile.hairLength}`);
    if (profile.skinTone) contextLines.push(`Skin tone: ${profile.skinTone}`);
    if (profile.styleGoal) contextLines.push(`Goal: ${profile.styleGoal}`);
    if (profile.budget) contextLines.push(`Budget: ${profile.budget}`);
    if (profile.maintenance) contextLines.push(`Time available per day: ${profile.maintenance}`);
  }

  const context = contextLines.length ? `Client profile:\n${contextLines.join('\n')}\n\n` : '';
  return `${context}Question: ${question}\nAnswer as a friendly beauty consultant in 3-4 sentences.`;
};

async function ask({ userId, question }) {
  try {
    const profile = await profileService.get(userId);
    const answer = await llmApiClient.ask({
      prompt: buildPrompt(question, profile),
    });
    return answer;
  } catch (err) {
    logger.error('Style Q&A failed', { userId, error: err.message });
    throw new AppError(
      'AI_QA_FAILED',
      'Our AI stylist is offline right now. Please try again later.',
      502
    );
  }
}

module.exports = { ask };
