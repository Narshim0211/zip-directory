import { API } from '../api';

/**
 * Visitor Newsletter API
 */

// Subscribe to hair tips newsletter
export const subscribeVisitorNewsletter = () =>
  API.post('/visitor/newsletter/subscribe');

// Unsubscribe from hair tips newsletter
export const unsubscribeVisitorNewsletter = () =>
  API.post('/visitor/newsletter/unsubscribe');

// Get visitor newsletter status
export const getVisitorNewsletterStatus = () =>
  API.get('/visitor/newsletter/status');

/**
 * Owner Newsletter API
 */

// Subscribe to business growth newsletter
export const subscribeOwnerNewsletter = () =>
  API.post('/owner/newsletter/subscribe');

// Unsubscribe from business growth newsletter
export const unsubscribeOwnerNewsletter = () =>
  API.post('/owner/newsletter/unsubscribe');

// Get owner newsletter status
export const getOwnerNewsletterStatus = () =>
  API.get('/owner/newsletter/status');

/**
 * Admin Newsletter API
 */

// Get overview (subscriber counts + recent campaigns)
export const getNewsletterOverview = () =>
  API.get('/admin/newsletters/overview');

// Get visitor subscribers
export const getVisitorSubscribers = (params) =>
  API.get('/admin/newsletters/subscribers/visitor', { params });

// Get owner subscribers
export const getOwnerSubscribers = (params) =>
  API.get('/admin/newsletters/subscribers/owner', { params });

// Create campaign
export const createCampaign = (data) =>
  API.post('/admin/newsletters/campaigns', data);

// Update campaign
export const updateCampaign = (id, data) =>
  API.patch(`/admin/newsletters/campaigns/${id}`, data);

// Get all campaigns
export const getCampaigns = (params) =>
  API.get('/admin/newsletters/campaigns', { params });

// Get single campaign
export const getCampaignById = (id) =>
  API.get(`/admin/newsletters/campaigns/${id}`);

// Delete campaign
export const deleteCampaign = (id) =>
  API.delete(`/admin/newsletters/campaigns/${id}`);

// Send test email
export const sendTestEmail = (id, email) =>
  API.post(`/admin/newsletters/campaigns/${id}/test`, { email });

// Schedule or send campaign
export const scheduleCampaign = (id, scheduledAt = null) =>
  API.post(`/admin/newsletters/campaigns/${id}/send`, { scheduledAt });
