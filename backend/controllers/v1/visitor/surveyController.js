const asyncHandler = require('../../../middleWare/asyncHandler');
const { vote, createSurvey } = require('../../../services/surveyService');

/**
 * @route   POST /api/v1/visitor/surveys
 * @desc    Create a new survey
 * @access  Private (visitor)
 */
exports.create = asyncHandler(async (req, res) => {
  const { question, options, category, expiresAt, visibility } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Question is required',
    });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least 2 options',
    });
  }

  const survey = await createSurvey({
    visitorId: req.user._id,
    question,
    options,
    category,
    expiresAt,
    visibility,
  });

  res.status(201).json({
    success: true,
    survey,
  });
});

/**
 * @route   POST /api/v1/visitor/surveys/:id/vote
 * @desc    Vote on a survey
 * @access  Private (visitor)
 */
exports.vote = asyncHandler(async (req, res) => {
  const { optionId } = req.body;

  if (!optionId) {
    return res.status(400).json({
      success: false,
      message: 'optionId is required',
    });
  }

  const survey = await vote({
    surveyId: req.params.id,
    userId: req.user._id,
    optionId,
  });

  res.json({
    success: true,
    survey,
  });
});
