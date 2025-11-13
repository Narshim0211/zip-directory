import axios from "axios";

const baseURL =
  process.env.REACT_APP_TIME_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.salonhub.com/api'
    : 'http://localhost:5000/api');

const timeClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage
timeClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses globally
timeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'Time service error';
    console.error(`[Time API Error] ${message}`, error.config?.url);
    return Promise.reject(error);
  }
);

export default timeClient;
