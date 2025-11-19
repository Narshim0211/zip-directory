const catchAsync = require('../utils/catchAsync');
const adminNewsletterService = require('../services/adminNewsletterService');

/**
 * Get subscriber counts for overview
 * GET /api/admin/newsletters/overview
 */
exports.getOverview = catchAsync(async (req, res) => {
  const [counts, recentCampaigns] = await Promise.all([
    adminNewsletterService.getSubscriberCounts(),
    adminNewsletterService.getRecentCampaigns(5),
  ]);
  
  res.json({
    subscriberCounts: counts,
    recentCampaigns,
  });
});

/**
 * Get visitor newsletter subscribers
 * GET /api/admin/newsletters/subscribers/visitor
 */
exports.getVisitorSubscribers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  
  const result = await adminNewsletterService.getVisitorSubscribers({ page, limit });
  res.json(result);
});

/**
 * Get owner newsletter subscribers
 * GET /api/admin/newsletters/subscribers/owner
 */
exports.getOwnerSubscribers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  
  const result = await adminNewsletterService.getOwnerSubscribers({ page, limit });
  res.json(result);
});

/**
 * Create a new newsletter campaign
 * POST /api/admin/newsletters/campaigns
 */
exports.createCampaign = catchAsync(async (req, res) => {
  const campaign = await adminNewsletterService.createCampaign(req.user._id, req.body);
  res.status(201).json(campaign);
});

/**
 * Update a campaign
 * PATCH /api/admin/newsletters/campaigns/:id
 */
exports.updateCampaign = catchAsync(async (req, res) => {
  const campaign = await adminNewsletterService.updateCampaign(
    req.params.id,
    req.user._id,
    req.body
  );
  res.json(campaign);
});

/**
 * Get all campaigns with optional filters
 * GET /api/admin/newsletters/campaigns
 */
exports.getCampaigns = catchAsync(async (req, res) => {
  const { audience, status, page, limit } = req.query;
  
  const result = await adminNewsletterService.getCampaigns({
    audience,
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  
  res.json(result);
});

/**
 * Get a single campaign by ID
 * GET /api/admin/newsletters/campaigns/:id
 */
exports.getCampaignById = catchAsync(async (req, res) => {
  const campaign = await adminNewsletterService.getCampaignById(req.params.id);
  res.json(campaign);
});

/**
 * Delete a campaign
 * DELETE /api/admin/newsletters/campaigns/:id
 */
exports.deleteCampaign = catchAsync(async (req, res) => {
  const result = await adminNewsletterService.deleteCampaign(req.params.id, req.user._id);
  res.json(result);
});

/**
 * Send a test email
 * POST /api/admin/newsletters/campaigns/:id/test
 */
exports.sendTestEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    const err = new Error('Email address is required');
    err.status = 400;
    throw err;
  }
  
  const result = await adminNewsletterService.sendTestEmail(req.params.id, email);
  res.json(result);
});

/**
 * Schedule or send a campaign
 * POST /api/admin/newsletters/campaigns/:id/send
 */
exports.scheduleCampaign = catchAsync(async (req, res) => {
  const { scheduledAt } = req.body;
  
  const campaign = await adminNewsletterService.scheduleCampaign(
    req.params.id,
    req.user._id,
    { scheduledAt }
  );
  
  res.json(campaign);
});
