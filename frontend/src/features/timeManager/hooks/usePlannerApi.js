import visitorTimeApi from '../../../api/visitorTimeApi';
import ownerTimeApi from '../../../api/ownerTimeApi';

// Adapter layer for planner endpoints. Keeps compatibility with current API shape
export default function usePlannerApi({ role = 'visitor' } = {}) {
  const api = role === 'owner' ? ownerTimeApi : visitorTimeApi;

  return {
    getDaily(date) {
      return api.getDailyTasks(date);
    },
    getWeekly(startDate) {
      return api.getWeeklyTasks(startDate);
    },
    getMonthly(month, year) {
      // If API has monthly endpoint, use it; else return empty
      return api.getMonthlyTasks ? api.getMonthlyTasks({ month, year }) : Promise.resolve([]);
    },
    createTask(payload) {
      return api.createTask(payload);
    },
    updateTask(id, payload) {
      return api.updateTask(id, payload);
    },
    deleteTask(id) {
      return api.deleteTask(id);
    },
    getQuote() {
      return api.getQuote ? api.getQuote() : Promise.resolve('');
    }
  };
}
