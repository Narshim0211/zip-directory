import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.salonhub.com/api'
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
});

// Automatically attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Disable caching for GET requests to ensure fresh data
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
  }
  
  // DEBUG: Log every request
  console.log(`🌐 [AXIOS] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log('   Params:', config.params);
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown API error';
    console.error(`[API ERROR] ${message}`, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;
