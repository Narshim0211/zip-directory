const catchAsync = require('../../utils/catchAsync');
const ownerNewsletterService = require('../../services/owner/ownerNewsletterService');

/**
 * Subscribe owner to business growth newsletter
 * POST /api/owner/newsletter/subscribe
 */
exports.subscribe = catchAsync(async (req, res) => {
  const result = await ownerNewsletterService.subscribe(req.user._id);
  res.json(result);
});

/**
 * Unsubscribe owner from business growth newsletter
 * POST /api/owner/newsletter/unsubscribe
 */
exports.unsubscribe = catchAsync(async (req, res) => {
  const result = await ownerNewsletterService.unsubscribe(req.user._id);
  res.json(result);
});

/**
 * Get owner's newsletter subscription status
 * GET /api/owner/newsletter/status
 */
exports.getStatus = catchAsync(async (req, res) => {
  const result = await ownerNewsletterService.getStatus(req.user._id);
  res.json(result);
});
