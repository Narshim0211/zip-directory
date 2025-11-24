import api from './axios';

/**
 * Visitor Newsletter API
 */

// Subscribe to hair tips newsletter
export const subscribeVisitorNewsletter = () =>
  api.post('/visitor/newsletter/subscribe');

// Unsubscribe from hair tips newsletter
export const unsubscribeVisitorNewsletter = () =>
  api.post('/visitor/newsletter/unsubscribe');

// Get visitor newsletter status
export const getVisitorNewsletterStatus = () =>
  api.get('/visitor/newsletter/status');

/**
 * Owner Newsletter API
 */

// Subscribe to business growth newsletter
export const subscribeOwnerNewsletter = () =>
  api.post('/owner/newsletter/subscribe');

// Unsubscribe from business growth newsletter
export const unsubscribeOwnerNewsletter = () =>
  api.post('/owner/newsletter/unsubscribe');

// Get owner newsletter status
export const getOwnerNewsletterStatus = () =>
  api.get('/owner/newsletter/status');

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
