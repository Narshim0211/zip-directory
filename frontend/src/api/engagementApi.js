import api from './axios';

// Unified Reaction Toggle (for both surveys and posts)
export const toggleReaction = async (contentType, contentId, reactionType) => {
	const { data } = await api.post(`/v1/analytics/reactions/toggle/${contentType}/${contentId}`, { reactionType });
	return data;
};

export const getReactions = async (contentType, contentId) => {
	const { data } = await api.get(`/v1/analytics/reactions/${contentType}/${contentId}`);
	return data;
};

// Impression Tracking (NEW - for both surveys and posts)
export const sendImpression = async (contentType, contentId) => {
	const { data } = await api.post(`/v1/analytics/impressions/${contentType}/${contentId}`);
	return data;
};

export const getImpressionCount = async (contentType, contentId) => {
	const { data } = await api.get(`/v1/analytics/impressions/${contentType}/${contentId}`);
	return data;
};

// Survey Engagement
export const getSurveyEngagement = async (surveyId) => {
	const { data } = await api.get(`/v1/analytics/survey/${surveyId}`);
	return data;
};
export const incrementSurveyView = async (surveyId) => {
	await api.post(`/v1/analytics/survey/view/${surveyId}`);
};
export const sendSurveyReaction = async (surveyId, reactionType) => {
	await api.post(`/v1/analytics/survey/react/${surveyId}`, { reactionType });
};

// Post Engagement
export const getPostEngagement = async (postId) => {
	const { data } = await api.get(`/v1/analytics/post/${postId}`);
	return data;
};
export const incrementPostView = async (postId) => {
	await api.post(`/v1/analytics/post/view/${postId}`);
};
export const sendPostReaction = async (postId, reactionType) => {
	await api.post(`/v1/analytics/post/react/${postId}`, { reactionType });
};

// Profile Insights (Owner analytics)
export const getProfileInsights = async (ownerId) => {
	const { data } = await api.get(`/v1/analytics/profile/${ownerId}`);
	return data;
};
export const incrementProfileView = async (ownerId) => {
	await api.post(`/v1/analytics/profile/view/${ownerId}`);
};
