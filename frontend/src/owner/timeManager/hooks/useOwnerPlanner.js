import { useState, useCallback } from 'react';
import api from '../../../api/axios';

/**
 * Owner Time Planner Hook
 * Handles all API calls for owner time management
 * Complete isolation from visitor time management
 */
const useOwnerPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get daily tasks
  const getDailyTasks = useCallback(async (date = new Date()) => {
    try {
      setLoading(true);
      setError(null);
      const dateStr = date.toISOString().split('T')[0];
      const response = await api.get(`/owner/time/tasks/daily?date=${dateStr}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load daily tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get weekly tasks
  const getWeeklyTasks = useCallback(async (startDate = new Date()) => {
    try {
      setLoading(true);
      setError(null);
      const dateStr = startDate.toISOString().split('T')[0];
      const response = await api.get(`/owner/time/tasks/weekly?startDate=${dateStr}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load weekly tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get monthly tasks
  const getMonthlyTasks = useCallback(async (month, year) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/owner/time/monthly?month=${month}&year=${year}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load monthly tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create daily task
  const createDailyTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/owner/time/tasks/daily', taskData);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(`/owner/time/tasks/daily/${taskId}`, updates);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/owner/time/tasks/daily/${taskId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId) => {
    try {
      setError(null);
      const response = await api.patch(`/owner/time/tasks/daily/${taskId}/toggle`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle task');
      throw err;
    }
  }, []);

  // Get analytics
  const getAnalytics = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      const response = await api.get(`/owner/time/analytics?startDate=${start}&endDate=${end}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getDailyTasks,
    getWeeklyTasks,
    getMonthlyTasks,
    createDailyTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getAnalytics
  };
};

export default useOwnerPlanner;
