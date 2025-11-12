const asyncHandler = require('../../../middleWare/asyncHandler');
const { createSurvey } = require('../../../services/surveyService');

/**
 * @route   POST /api/v1/owner/surveys
 * @desc    Create a new survey
 * @access  Private (owner)
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
    ownerId: req.user._id,
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
