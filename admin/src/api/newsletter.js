import api from './axios';

/**
 * Admin Newsletter API
 */

// Get overview (subscriber counts + recent campaigns)
export const getNewsletterOverview = () =>
  api.get('/admin/newsletters/overview');

// Get visitor subscribers
export const getVisitorSubscribers = (params) =>
  api.get('/admin/newsletters/subscribers/visitor', { params });

// Get owner subscribers
export const getOwnerSubscribers = (params) =>
  api.get('/admin/newsletters/subscribers/owner', { params });

// Create campaign
export const createCampaign = (data) =>
  api.post('/admin/newsletters/campaigns', data);

// Update campaign
export const updateCampaign = (id, data) =>
  api.patch(`/admin/newsletters/campaigns/${id}`, data);

// Get all campaigns
export const getCampaigns = (params) =>
  api.get('/admin/newsletters/campaigns', { params });

// Get single campaign
export const getCampaignById = (id) =>
  api.get(`/admin/newsletters/campaigns/${id}`);

// Delete campaign
export const deleteCampaign = (id) =>
  api.delete(`/admin/newsletters/campaigns/${id}`);

// Send test email
export const sendTestEmail = (id, email) =>
  api.post(`/admin/newsletters/campaigns/${id}/test`, { email });

// Schedule or send campaign
export const scheduleCampaign = (id, scheduledAt = null) =>
  api.post(`/admin/newsletters/campaigns/${id}/send`, { scheduledAt });
