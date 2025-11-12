const asyncHandler = require('../../../middleWare/asyncHandler');
const { vote } = require('../../../services/surveyService');

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
