import api from "./axios";

/**
 * Time Manager API Client
 *
 * ✅ Now using unified axios instance from axios.js
 * All interceptors (auth, logging, error handling) are already configured
 *
 * This file is kept for backwards compatibility but now just re-exports
 * the main api instance. All time-related routes should use /v1/time-manager/*
 */

export default api;
