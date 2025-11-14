import api from "./axios";

const base = "/visitor/style";

const config = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const hairTryOn = (formData) => api.post(`${base}/hair-tryon`, formData, config);

export const outfitTryOn = (formData) => api.post(`${base}/outfit-tryon`, formData, config);

export const askQuestion = (payload) => api.post(`${base}/qa`, payload);

export const getProfile = () => api.get(`${base}/profile`);

export const saveProfile = (payload) => api.post(`${base}/profile`, payload);
