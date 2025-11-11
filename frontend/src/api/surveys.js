import api from "./axios";

export const fetchSurveysFeed = (params = {}) => api.get("/surveys/feed", { params });
export const fetchOwnedSurveys = () => api.get("/surveys/mine");
