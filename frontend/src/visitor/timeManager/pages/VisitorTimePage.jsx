import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../../../shared/timeManager/components/ErrorBoundary';
import TaskCard from '../../../shared/timeManager/components/TaskCard';
import useVisitorPlanner from '../hooks/useVisitorPlanner';
import './VisitorTimePage.css';

/**
 * Visitor Time Manager Page
 * Complete time management dashboard for visitors
 * Isolated from owner time management
 */
const VisitorTimePage = () => {
  const {
    loading,
    error,
    getDailyTasks,
    createDailyTask,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
    getAnalytics
  } = useVisitorPlanner();

  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [newTask, setNewTask] = useState({
    task: '',
    description: '',
    session: 'morning',
    priority: 'medium',
    reminder: {
      enabled: false,
      type: 'email',
      time: '09:00'
    }
  });

  // Load daily tasks
  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getDailyTasks(selectedDate);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const today = new Date();
      const data = await getAnalytics(firstDayOfMonth, today);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.task.trim()) return;

    try {
      const taskData = {
        ...newTask,
        date: selectedDate.toISOString()
      };
      await createDailyTask(taskData);
      setNewTask({
        task: '',
        description: '',
        session: 'morning',
        priority: 'medium',
        reminder: { enabled: false, type: 'email', time: '09:00' }
      });
      setShowAddTask(false);
      await loadTasks();
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await toggleTaskCompletion(taskId);
      await loadTasks();
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(taskId);
      await loadTasks();
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleEditTask = (task) => {
    // TODO: Implement edit functionality
    console.log('Edit task:', task);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const tasksBySession = {
    morning: tasks.filter(t => t.session === 'morning'),
    afternoon: tasks.filter(t => t.session === 'afternoon'),
    evening: tasks.filter(t => t.session === 'evening'),
    night: tasks.filter(t => t.session === 'night')
  };

  return (
    <div className="visitor-time-page">
      <ErrorBoundary>
        {/* Header */}
        <div className="time-page-header">
          <h1>⏰ Time Manager</h1>
          <p>Plan your day, track your progress, achieve your goals</p>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <ErrorBoundary>
            <div className="analytics-summary">
              <div className="analytics-card">
                <div className="analytics-card__value">{analytics.totalTasks}</div>
                <div className="analytics-card__label">Total Tasks</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-card__value">{analytics.completedTasks}</div>
                <div className="analytics-card__label">Completed</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-card__value">{analytics.pendingTasks}</div>
                <div className="analytics-card__label">Pending</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-card__value">{analytics.completionRate}%</div>
                <div className="analytics-card__label">Completion Rate</div>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* Date Navigator */}
        <div className="date-navigator">
          <button onClick={goToPreviousDay} className="date-nav-btn">← Previous</button>
          <div className="date-display">
            <h2>{formatDate(selectedDate)}</h2>
            <button onClick={goToToday} className="btn-today">Today</button>
          </div>
          <button onClick={goToNextDay} className="date-nav-btn">Next →</button>
        </div>

        {/* Add Task Button */}
        <div className="add-task-section">
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="btn-add-task"
          >
            {showAddTask ? '✕ Cancel' : '+ Add Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <ErrorBoundary>
            <form onSubmit={handleAddTask} className="add-task-form">
              <input
                type="text"
                placeholder="What do you need to do?"
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                className="task-input"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="task-textarea"
                rows="2"
              />
              <div className="task-form-row">
                <select
                  value={newTask.session}
                  onChange={(e) => setNewTask({ ...newTask, session: e.target.value })}
                  className="task-select"
                >
                  <option value="morning">🌅 Morning</option>
                  <option value="afternoon">☀️ Afternoon</option>
                  <option value="evening">🌆 Evening</option>
                  <option value="night">🌙 Night</option>
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="task-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="task-form-reminder">
                <label>
                  <input
                    type="checkbox"
                    checked={newTask.reminder.enabled}
                    onChange={(e) => setNewTask({
                      ...newTask,
                      reminder: { ...newTask.reminder, enabled: e.target.checked }
                    })}
                  />
                  Set Reminder
                </label>
                {newTask.reminder.enabled && (
                  <div className="reminder-options">
                    <select
                      value={newTask.reminder.type}
                      onChange={(e) => setNewTask({
                        ...newTask,
                        reminder: { ...newTask.reminder, type: e.target.value }
                      })}
                      className="task-select-sm"
                    >
                      <option value="email">📧 Email</option>
                      <option value="sms">📱 SMS</option>
                      <option value="both">🔔 Both</option>
                    </select>
                    <input
                      type="time"
                      value={newTask.reminder.time}
                      onChange={(e) => setNewTask({
                        ...newTask,
                        reminder: { ...newTask.reminder, time: e.target.value }
                      })}
                      className="task-input-sm"
                    />
                  </div>
                )}
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </ErrorBoundary>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Tasks by Session */}
        <ErrorBoundary>
          <div className="tasks-container">
            {['morning', 'afternoon', 'evening', 'night'].map((session) => (
              <div key={session} className="session-section">
                <h3 className="session-title">
                  {session === 'morning' && '🌅 Morning'}
                  {session === 'afternoon' && '☀️ Afternoon'}
                  {session === 'evening' && '🌆 Evening'}
                  {session === 'night' && '🌙 Night'}
                  <span className="task-count">({tasksBySession[session].length})</span>
                </h3>
                {tasksBySession[session].length === 0 ? (
                  <div className="empty-session">
                    No tasks scheduled
                  </div>
                ) : (
                  tasksBySession[session].map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            ))}
          </div>
        </ErrorBoundary>

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Loading...</div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default VisitorTimePage;
