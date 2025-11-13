import React, { useEffect, useState } from 'react';
import visitorTimeApi from '../../../../api/visitorTimeApi';
import TaskCard from '../../../../shared/components/time/TaskCard';
import TaskForm from '../../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import './VisitorWeeklyPlanner.css';

const VisitorWeeklyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(getMonday(new Date()));

  // Get Monday of the current week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  const fetchTasks = async (startDate) => {
    try {
      setLoading(true);
      setError(null);
      const data = await visitorTimeApi.getWeeklyTasks(startDate);
      setTasks(Array.isArray(data) ? data : data?.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(selectedWeek);
  }, [selectedWeek]);

  const handleCreateTask = async (formData) => {
    try {
      const newTask = await visitorTimeApi.createTask({
        ...formData,
        scope: 'weekly',
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

  const handleWeekChange = (direction) => {
    const current = new Date(selectedWeek);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(current.toISOString().split('T')[0]);
  };

  const formatWeekRange = (monday) => {
    const start = new Date(monday);
    const end = new Date(monday);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="visitor-weekly-planner">
      <div className="planner-header">
        <h2>Weekly Planner</h2>
        <div className="header-controls">
          <div className="week-navigator">
            <button onClick={() => handleWeekChange('prev')} className="nav-btn">
              ← Prev
            </button>
            <span className="week-range">{formatWeekRange(selectedWeek)}</span>
            <button onClick={() => handleWeekChange('next')} className="nav-btn">
              Next →
            </button>
          </div>
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
            initialData={editingTask ? { ...editingTask } : { scope: 'weekly' }}
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
        <LoadingSpinner message="Loading weekly tasks..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchTasks(selectedWeek)}>Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks for this week.</p>
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

export default VisitorWeeklyPlanner;
