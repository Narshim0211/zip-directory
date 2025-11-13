import timeClient from './timeClient';

const BASE = '/visitor/time';

export default {
  // Tasks
  getTasks: (params = {}) => timeClient.get(`${BASE}/tasks`, { params }).then((r) => r.data),
  getTask: (taskId) => timeClient.get(`${BASE}/tasks/${taskId}`).then((r) => r.data),
  createTask: (data) => timeClient.post(`${BASE}/tasks`, data).then((r) => r.data),
  updateTask: (taskId, updates) => timeClient.put(`${BASE}/tasks/${taskId}`, updates).then((r) => r.data),
  deleteTask: (taskId) => timeClient.delete(`${BASE}/tasks/${taskId}`).then((r) => r.data),

  // Daily/Weekly tasks
  getDailyTasks: (date) => timeClient.get(`${BASE}/tasks/daily`, { params: { date } }).then((r) => r.data),
  getWeeklyTasks: (startDate) => timeClient.get(`${BASE}/tasks/weekly`, { params: { startDate } }).then((r) => r.data),
  getMonthlyTasks: (params) => timeClient.get(`${BASE}/monthly`, { params }).then((r) => r.data),

  // Goals
  getGoals: (params = {}) => timeClient.get(`${BASE}/goals`, { params }).then((r) => r.data),
  getGoal: (goalId) => timeClient.get(`${BASE}/goals/${goalId}`).then((r) => r.data),
  createGoal: (data) => timeClient.post(`${BASE}/goals`, data).then((r) => r.data),
  updateGoal: (goalId, updates) => timeClient.put(`${BASE}/goals/${goalId}`, updates).then((r) => r.data),

  // Reminders
  getReminders: (params = {}) => timeClient.get(`${BASE}/reminders`, { params }).then((r) => r.data),
  createReminder: (data) => timeClient.post(`${BASE}/reminders`, data).then((r) => r.data),

  // Reflections
  getReflections: (params = {}) => timeClient.get(`${BASE}/reflections`, { params }).then((r) => r.data),
  createReflection: (data) => timeClient.post(`${BASE}/reflections`, data).then((r) => r.data),

  // Analytics
  getAnalytics: (params = {}) => timeClient.get(`${BASE}/analytics`, { params }).then((r) => r.data),
  
  // Quote of the day
  getQuote: () => timeClient.get(`${BASE}/quote`).then((r) => r.data),
};
