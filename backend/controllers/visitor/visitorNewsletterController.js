const catchAsync = require('../../utils/catchAsync');
const visitorNewsletterService = require('../../services/visitor/visitorNewsletterService');

/**
 * Subscribe visitor to hair tips newsletter
 * POST /api/visitor/newsletter/subscribe
 */
exports.subscribe = catchAsync(async (req, res) => {
  const result = await visitorNewsletterService.subscribe(req.user._id);
  res.json(result);
});

/**
 * Unsubscribe visitor from hair tips newsletter
 * POST /api/visitor/newsletter/unsubscribe
 */
exports.unsubscribe = catchAsync(async (req, res) => {
  const result = await visitorNewsletterService.unsubscribe(req.user._id);
  res.json(result);
});

/**
 * Get visitor's newsletter subscription status
 * GET /api/visitor/newsletter/status
 */
exports.getStatus = catchAsync(async (req, res) => {
  const result = await visitorNewsletterService.getStatus(req.user._id);
  res.json(result);
});
