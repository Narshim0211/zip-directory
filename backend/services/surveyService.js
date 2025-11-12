const { nanoid } = require('nanoid');
const Survey = require('../models/Survey');

/**
 * Normalize survey options to ensure they have id, label, and votes
 */
const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];

  return options.map((o, index) => {
    // Handle different input formats
    if (typeof o === 'string') {
      return {
        id: `opt-${index}`,
        label: o.trim(),
        votes: 0,
      };
    }

    return {
      id: o.id || o._id || `opt-${index}`,
      label: o.label || o.text || String(o),
      votes: Number(o.votes || 0),
    };
  });
};

/**
 * Create a new survey
 */
const createSurvey = async ({ ownerId, question, options, category, expiresAt, visibility }) => {
  const formattedOptions = normalizeOptions(options);

  if (formattedOptions.length < 2) {
    throw new Error('Provide at least 2 options');
  }

  const survey = new Survey({
    author: ownerId,
    ownerId, // for legacy compatibility
    question: question.trim(),
    options: formattedOptions,
    category: category || 'General',
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    visibility: visibility || 'public',
    visibleToVisitors: true,
  });

  await survey.save();
  return survey;
};

/**
 * Vote on a survey option
 */
const vote = async ({ surveyId, userId, optionId }) => {
  const survey = await Survey.findById(surveyId);

  if (!survey) {
    const error = new Error('Survey not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if already voted
  if (survey.voters.some(v => v.toString() === userId.toString())) {
    const error = new Error('You already voted on this survey');
    error.statusCode = 409;
    throw error;
  }

  // Find the option
  const option = survey.options.find(o => o.id === optionId);
  if (!option) {
    const error = new Error('Invalid option');
    error.statusCode = 400;
    throw error;
  }

  // Update votes
  option.votes += 1;
  survey.totalVotes = (survey.totalVotes || 0) + 1;
  survey.voters.push(userId);

  await survey.save();
  return survey;
};

/**
 * Get surveys visible to visitors
 */
const getVisitorSurveys = async ({ limit = 30 }) => {
  return Survey.find({ visibleToVisitors: true })
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  normalizeOptions,
  createSurvey,
  vote,
  getVisitorSurveys,
};
