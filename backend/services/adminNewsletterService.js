const User = require('../models/User');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const emailService = require('./emailService');

/**
 * Admin Newsletter Service
 * Handles newsletter campaign management and sending
 */

/**
 * Get all visitor newsletter subscribers
 */
async function getVisitorSubscribers({ page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  
  const [subscribers, total] = await Promise.all([
    User.find({ 
      role: 'visitor',
      'newsletter.hairTips': true,
    })
    .select('name firstName lastName email newsletter createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(),
    
    User.countDocuments({ 
      role: 'visitor',
      'newsletter.hairTips': true,
    }),
  ]);
  
  return {
    subscribers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get all owner newsletter subscribers
 */
async function getOwnerSubscribers({ page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  
  const [subscribers, total] = await Promise.all([
    User.find({ 
      role: 'owner',
      'newsletter.businessGrowth': true,
    })
    .select('name firstName lastName email newsletter createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(),
    
    User.countDocuments({ 
      role: 'owner',
      'newsletter.businessGrowth': true,
    }),
  ]);
  
  return {
    subscribers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get subscriber counts for dashboard overview
 */
async function getSubscriberCounts() {
  const [visitorCount, ownerCount] = await Promise.all([
    User.countDocuments({ 
      role: 'visitor',
      'newsletter.hairTips': true,
    }),
    User.countDocuments({ 
      role: 'owner',
      'newsletter.businessGrowth': true,
    }),
  ]);
  
  return {
    visitors: visitorCount,
    owners: ownerCount,
    total: visitorCount + ownerCount,
  };
}

/**
 * Create a new newsletter campaign
 */
async function createCampaign(adminId, campaignData) {
  const { audience, subject, preheader, contentHtml, contentText } = campaignData;
  
  if (!audience || !subject || !contentHtml) {
    const err = new Error('audience, subject, and contentHtml are required');
    err.status = 400;
    throw err;
  }
  
  if (!['VISITOR', 'OWNER'].includes(audience)) {
    const err = new Error('audience must be either VISITOR or OWNER');
    err.status = 400;
    throw err;
  }
  
  const campaign = new NewsletterCampaign({
    audience,
    subject,
    preheader: preheader || '',
    contentHtml,
    contentText: contentText || '',
    createdByAdminId: adminId,
    status: 'DRAFT',
  });
  
  await campaign.save();
  
  return campaign;
}

/**
 * Update an existing campaign (only if status is DRAFT)
 */
async function updateCampaign(campaignId, adminId, updates) {
  const campaign = await NewsletterCampaign.findOne({
    _id: campaignId,
    createdByAdminId: adminId,
  });
  
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  
  if (campaign.status !== 'DRAFT') {
    const err = new Error('Can only update draft campaigns');
    err.status = 400;
    throw err;
  }
  
  const allowedFields = ['subject', 'preheader', 'contentHtml', 'contentText'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      campaign[field] = updates[field];
    }
  });
  
  await campaign.save();
  
  return campaign;
}

/**
 * Get all campaigns with optional filters
 */
async function getCampaigns({ audience, status, page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const query = {};
  
  if (audience) {
    query.audience = audience;
  }
  
  if (status) {
    query.status = status;
  }
  
  const [campaigns, total] = await Promise.all([
    NewsletterCampaign.find(query)
      .populate('createdByAdminId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    
    NewsletterCampaign.countDocuments(query),
  ]);
  
  return {
    campaigns,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single campaign by ID
 */
async function getCampaignById(campaignId) {
  const campaign = await NewsletterCampaign.findById(campaignId)
    .populate('createdByAdminId', 'name email');
  
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  
  return campaign;
}

/**
 * Delete a campaign (only if status is DRAFT)
 */
async function deleteCampaign(campaignId, adminId) {
  const campaign = await NewsletterCampaign.findOne({
    _id: campaignId,
    createdByAdminId: adminId,
  });
  
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  
  if (campaign.status !== 'DRAFT') {
    const err = new Error('Can only delete draft campaigns');
    err.status = 400;
    throw err;
  }
  
  await campaign.deleteOne();
  
  return {
    success: true,
    message: 'Campaign deleted successfully',
  };
}

/**
 * Get recent campaigns for overview page
 */
async function getRecentCampaigns(limit = 5) {
  const campaigns = await NewsletterCampaign.find()
    .populate('createdByAdminId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  
  return campaigns;
}

/**
 * Send a test email
 */
async function sendTestEmail(campaignId, testEmail) {
  const campaign = await NewsletterCampaign.findById(campaignId);
  
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  
  // Send test email using email service
  const result = await emailService.sendTestEmail(testEmail, campaign);
  
  if (!result.success) {
    const err = new Error(`Failed to send test email: ${result.error}`);
    err.status = 500;
    throw err;
  }
  
  return {
    success: true,
    message: `Test email sent to ${testEmail}`,
    messageId: result.messageId,
  };
}

/**
 * Schedule or send a campaign
 */
async function scheduleCampaign(campaignId, adminId, { scheduledAt } = {}) {
  const campaign = await NewsletterCampaign.findOne({
    _id: campaignId,
    createdByAdminId: adminId,
  });
  
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  
  if (campaign.status !== 'DRAFT') {
    const err = new Error('Can only schedule draft campaigns');
    err.status = 400;
    throw err;
  }
  
  if (scheduledAt) {
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      const err = new Error('Scheduled time must be in the future');
      err.status = 400;
      throw err;
    }
    campaign.scheduledAt = scheduleDate;
    campaign.status = 'SCHEDULED';
  } else {
    // Send immediately
    campaign.status = 'SENDING';
  }
  
  await campaign.save();
  
  // If sending immediately, trigger the send process
  if (!scheduledAt) {
    // TODO: Trigger background job to send emails
    // For now, we'll implement a basic send function
    setImmediate(() => sendCampaignEmails(campaignId));
  }
  
  return campaign;
}

/**
 * Send campaign emails (background process)
 */
async function sendCampaignEmails(campaignId) {
  try {
    const campaign = await NewsletterCampaign.findById(campaignId);
    
    if (!campaign || campaign.status !== 'SENDING') {
      return;
    }
    
    // Get subscribers based on audience
    const field = campaign.audience === 'VISITOR' ? 'newsletter.hairTips' : 'newsletter.businessGrowth';
    const subscribers = await User.find({
      role: campaign.audience.toLowerCase(),
      [field]: true,
    }).select('email name firstName lastName');
    
    campaign.stats.totalRecipients = subscribers.length;
    await campaign.save();
    
    // Send emails using email service with batch processing
    const results = await emailService.sendCampaignEmails(
      campaign,
      subscribers,
      (progress) => {
        console.log(`📊 Campaign Progress: ${progress.percentage}% (${progress.sent}/${progress.total})`);
      }
    );
    
    // Update campaign with results
    campaign.status = results.failed === 0 ? 'SENT' : 'FAILED';
    campaign.sentAt = new Date();
    campaign.stats.sentCount = results.sent;
    campaign.stats.failedCount = results.failed;
    
    if (results.errors.length > 0) {
      campaign.errorLog = JSON.stringify(results.errors.slice(0, 10)); // Store first 10 errors
    }
    
    await campaign.save();
    
    console.log(`✅ Campaign sent: ${results.sent} successful, ${results.failed} failed`);
    
  } catch (error) {
    console.error('Error sending campaign emails:', error);
    
    // Update campaign with error
    await NewsletterCampaign.findByIdAndUpdate(campaignId, {
      status: 'FAILED',
      errorLog: error.message,
    });
  }
}

module.exports = {
  getVisitorSubscribers,
  getOwnerSubscribers,
  getSubscriberCounts,
  createCampaign,
  updateCampaign,
  getCampaigns,
  getCampaignById,
  deleteCampaign,
  getRecentCampaigns,
  sendTestEmail,
  scheduleCampaign,
  sendCampaignEmails,
};
