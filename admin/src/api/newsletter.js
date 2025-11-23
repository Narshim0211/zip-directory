import api from './axios';

/**
 * Admin Newsletter API
 */

// Get overview (subscriber counts + recent campaigns)
export const getNewsletterOverview = () =>
  api.get('/api/admin/newsletters/overview');

// Get visitor subscribers
export const getVisitorSubscribers = (params) =>
  api.get('/api/admin/newsletters/subscribers/visitor', { params });

// Get owner subscribers
export const getOwnerSubscribers = (params) =>
  api.get('/api/admin/newsletters/subscribers/owner', { params });

// Create campaign
export const createCampaign = (data) =>
  api.post('/api/admin/newsletters/campaigns', data);

// Update campaign
export const updateCampaign = (id, data) =>
  api.patch(`/api/admin/newsletters/campaigns/${id}`, data);

// Get all campaigns
export const getCampaigns = (params) =>
  api.get('/api/admin/newsletters/campaigns', { params });

// Get single campaign
export const getCampaignById = (id) =>
  api.get(`/api/admin/newsletters/campaigns/${id}`);

// Delete campaign
export const deleteCampaign = (id) =>
  api.delete(`/api/admin/newsletters/campaigns/${id}`);

// Send test email
export const sendTestEmail = (id, email) =>
  api.post(`/api/admin/newsletters/campaigns/${id}/test`, { email });

// Schedule or send campaign
export const scheduleCampaign = (id, scheduledAt = null) =>
  api.post(`/api/admin/newsletters/campaigns/${id}/send`, { scheduledAt });
