import React, { useEffect, useState } from 'react';
import visitorTimeApi from '../../../../api/visitorTimeApi';
import TaskCard from '../../../../shared/components/time/TaskCard';
import TaskForm from '../../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import './VisitorDailyPlanner.css';

const VisitorDailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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

  const handleCreateTask = async (formData) => {
    try {
      const newTask = await visitorTimeApi.createTask({
        ...formData,
        date: selectedDate,
      });
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
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

  return (
    <div className="visitor-daily-planner">
      <div className="planner-header">
        <h2>Daily Planner</h2>
        <div className="header-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            disabled={showForm || editingTask}
          >
            + New Task
          </button>
        </div>
      </div>

      {(showForm || editingTask) && (
        <div className="form-modal">
          <TaskForm
            initialData={editingTask || {}}
            mode={editingTask ? 'edit' : 'create'}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchTasks(selectedDate)}>Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks for this day.</p>
          <button onClick={() => setShowForm(true)} className="btn-secondary">
            Create your first task
          </button>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorDailyPlanner;
