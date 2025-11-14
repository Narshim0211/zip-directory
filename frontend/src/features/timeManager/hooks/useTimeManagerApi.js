import { useCallback } from "react";
import api from "../../../api/axios";

export default function useTimeManagerApi(role = "visitor") {
  const prefix = role === "owner" ? "owner" : "visitor";
  const endpoint = `${prefix}/time-manager`;

  const fetchDaily = useCallback(
    (date) => api.get(`${endpoint}/daily`, { params: { date } }).then((r) => r.data),
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
    (payload) => api.post(`${endpoint}/daily`, payload).then((r) => r.data),
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
  return {
    fetchDaily,
    fetchWeekly,
    fetchMonthly,
    toggleComplete,
    createDaily,
    createWeekly,
    createMonthly,
  };
}
