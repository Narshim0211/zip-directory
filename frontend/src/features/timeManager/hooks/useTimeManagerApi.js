import { useCallback } from "react";
import api from "../../../api/axios";

export default function useTimeManagerApi(role = "visitor") {
  const prefix = role === "owner" ? "owner" : "visitor";
  const endpoint = `${prefix}/time-manager`;

  console.log(`🔧 [useTimeManagerApi] Initialized with role="${role}", endpoint="${endpoint}"`);

  const fetchDaily = useCallback(
    (date) => {
      console.log(`📥 [API] GET ${endpoint}/daily?date=${date}`);
      // Add timestamp to prevent caching
      return api.get(`${endpoint}/daily`, { 
        params: { 
          date,
          _t: Date.now()  // Cache buster
        } 
      }).then((r) => r.data);
    },
    [endpoint]
  );
  const fetchWeekly = useCallback(
    (start, end) => api.get(`${endpoint}/weekly`, { params: { startDate: start, endDate: end } }).then((r) => r.data),
    [endpoint]
  );
  const fetchMonthly = useCallback(
    (month, year) => api.get(`${endpoint}/monthly`, { params: { month, year } }).then((r) => r.data),
    [endpoint]
  );
  const createDaily = useCallback(
    (payload) => {
      console.log(`📤 [API] POST ${endpoint}/daily`, payload);
      return api.post(`${endpoint}/daily`, payload).then((r) => r.data);
    },
    [endpoint]
  );
  const createWeekly = useCallback(
    (payload) => api.post(`${endpoint}/weekly`, payload).then((r) => r.data),
    [endpoint]
  );
  const createMonthly = useCallback(
    (payload) => api.post(`${endpoint}/monthly`, payload).then((r) => r.data),
    [endpoint]
  );
  const toggleComplete = useCallback(
    (taskId, updates) => api.put(`${endpoint}/daily/${taskId}`, updates).then((r) => r.data),
    [endpoint]
  );
  const updateTask = useCallback(
    (taskId, updates) => api.put(`${endpoint}/daily/${taskId}`, updates).then((r) => r.data),
    [endpoint]
  );
  const deleteTask = useCallback(
    (taskId) => api.delete(`${endpoint}/daily/${taskId}`).then((r) => r.data),
    [endpoint]
  );
  return {
    fetchDaily,
    fetchWeekly,
    fetchMonthly,
    toggleComplete,
    updateTask,
    deleteTask,
    createDaily,
    createWeekly,
    createMonthly,
  };
}
