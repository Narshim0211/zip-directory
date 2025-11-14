import React, { useEffect, useState } from 'react';
import visitorTimeApi from '../../../../api/visitorTimeApi';
import DailySessions from '../../../../shared/components/time/DailySessions';
import TaskForm from '../../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import './VisitorDailyPlanner.css';

const VisitorDailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchTasks = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await visitorTimeApi.getDailyTasks(date);
      setTasks(Array.isArray(data) ? data : data?.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const handleAddTask = (session) => {
    setSelectedSession(session);
    setShowForm(true);
  };

  const handleCreateTask = async (formData) => {
    try {
      const newTask = await visitorTimeApi.createTask({
        ...formData,
        date: selectedDate,
        session: selectedSession || formData.session,
        scope: 'daily', // Lock to daily scope
      });
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
      setSelectedSession(null);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      const updated = await visitorTimeApi.updateTask(editingTask._id, formData);
      setTasks(prev => prev.map(t => t._id === editingTask._id ? updated : t));
      setEditingTask(null);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleCompleteTask = async (taskId, newStatus) => {
    try {
      const updated = await visitorTimeApi.completeTask(taskId, newStatus);
      setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await visitorTimeApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() === today.getTime()) {
      return 'Today';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (selected.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (selected.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="visitor-daily-planner">
      <div className="planner-header">
        <div className="header-title">
          <h2>Daily Planner</h2>
          <p className="header-subtitle">Organize your day by session</p>
        </div>
        <div className="header-controls">
          <div className="date-navigation">
            <button
              onClick={() => changeDate(-1)}
              className="btn-nav"
              title="Previous day"
            >
              ←
            </button>
            <div className="date-display">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-picker"
              />
              <div className="date-label">{formatDisplayDate(selectedDate)}</div>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="btn-nav"
              title="Next day"
            >
              →
            </button>
            <button
              onClick={goToToday}
              className="btn-today"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {(showForm || editingTask) && (
        <div className="form-modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingTask(null);
          setSelectedSession(null);
        }}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initialData={editingTask ? editingTask : {
                session: selectedSession || 'Morning',
                scope: 'daily'
              }}
              mode={editingTask ? 'edit' : 'create'}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
                setSelectedSession(null);
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : error ? (
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={() => fetchTasks(selectedDate)} className="btn-retry">
              Retry
            </button>
          </div>
        </div>
      ) : (
        <DailySessions
          tasks={tasks}
          onTaskComplete={handleCompleteTask}
          onTaskEdit={setEditingTask}
          onTaskDelete={handleDeleteTask}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
};

export default VisitorDailyPlanner;
