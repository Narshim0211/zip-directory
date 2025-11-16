import React, { useEffect, useMemo, useState } from 'react';
import TaskCard from '../../../shared/components/time/TaskCard';
import TaskForm from '../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import usePlannerApi from '../hooks/usePlannerApi';
import useLocalSync from '../hooks/useLocalSync';
import useOwnerBusinesses from '../hooks/useOwnerBusinesses';
import '../styles/timeManager.css';

// Session configuration - lowercase to match backend
const SESSIONS = [
  { key: 'morning', label: 'Morning', icon: '🌅' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { key: 'evening', label: 'Evening', icon: '🌙' }
];

const formatSessionLabel = (value) => {
  if (!value) return 'Morning';
  const normalized = value.toString().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default function DailyPlanner({ role = 'visitor' }) {
  const api = usePlannerApi({ role });
  const { options: assignmentSuggestions } = useOwnerBusinesses();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [quickAddSession, setQuickAddSession] = useState(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [formSession, setFormSession] = useState('morning');

  useLocalSync('tm.daily.tasks', tasks);

  const grouped = useMemo(() => {
    const out = { morning: [], afternoon: [], evening: [] };
    for (const t of tasks) {
      const session = (t.session || 'morning').toLowerCase();
      if (out[session]) {
        out[session].push(t);
      }
    }
    return out;
  }, [tasks]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDaily(selectedDate);
      const arr = Array.isArray(data) ? data : data?.tasks || [];
      setTasks(arr);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedDate]);

  const toggleComplete = async (task) => {
    const updated = { completed: !(task.completed) };
    const res = await api.updateTask(task._id, updated);
    setTasks(prev => prev.map(t => (t._id === task._id ? res.task || res : t)));
  };

  const handleCreate = async (payload) => {
    try {
      // Ensure session is lowercase
      const taskData = {
        ...payload,
        date: selectedDate,
        taskDate: selectedDate,
        session: payload.session?.toLowerCase() || 'morning',
        scopeTag: 'daily'
      };

      const res = await api.createTask(taskData);
      const created = res.task || res;
      setTasks(prev => [...prev, created]);
      setShowForm(false);
      setFormSession('morning');
      await load(); // Refresh to ensure consistency
    } catch (error) {
      console.error('Failed to create task:', error);
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const updates = {
        ...payload,
        session: payload.session?.toLowerCase() || editing.session
      };
      const res = await api.updateTask(editing._id, updates);
      const updated = res.task || res;
      setTasks(prev => prev.map(t => (t._id === editing._id ? updated : t)));
      setEditing(null);
      setFormSession('morning');
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(task._id);
      setTasks(prev => prev.filter(t => t._id !== task._id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleQuickAdd = async (session) => {
    if (!quickAddTitle.trim()) return;

    try {
      const taskData = {
        title: quickAddTitle,
        date: selectedDate,
        taskDate: selectedDate,
        session: session,
        scopeTag: 'daily'
      };

      const res = await api.createTask(taskData);
      const created = res.task || res;
      setTasks(prev => [...prev, created]);
      setQuickAddTitle('');
      setQuickAddSession(null);
      await load(); // Refresh to ensure consistency
    } catch (error) {
      console.error('Failed to quick-add task:', error);
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const openSessionForm = (sessionKey) => {
    setFormSession(sessionKey);
    setEditing(null);
    setQuickAddSession(null);
    setShowForm(true);
  };

  const formInitialData = editing
    ? { ...editing, session: formatSessionLabel(editing.session) }
    : { session: formatSessionLabel(formSession) };

  return (
    <div className="tm-daily">
      <div className="tm-head">
        <div className="tm-head__left">
          <h3>Daily Planner</h3>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {(showForm || editing) && (
        <div className="tm-form-wrap">
          <TaskForm
            initialData={formInitialData}
            mode={editing ? 'edit' : 'create'}
            showAssigned={role === 'owner'}
            assignmentSuggestions={role === 'owner' ? assignmentSuggestions : []}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              setFormSession('morning');
            }}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading today's tasks..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      ) : (
        <div className="tm-daily__grid">
          {SESSIONS.map((sessionConfig) => {
            const sessionTasks = grouped[sessionConfig.key];
            return (
              <div key={sessionConfig.key} className="tm-slot">
                <div className="session-block">
                  <div className="session-header">
                    <div className="session-heading-left">
                      <span className="session-icon">{sessionConfig.icon}</span>
                      <span className="session-title">{sessionConfig.label}</span>
                      <span className="tm-slot__count session-count">({sessionTasks.length})</span>
                    </div>
                    <button
                      className="session-add-btn"
                      onClick={() => openSessionForm(sessionConfig.key)}
                      disabled={!!editing || showForm}
                    >
                      + Add Task
                    </button>
                  </div>

                  {quickAddSession === sessionConfig.key ? (
                    <div className="tm-quick-add">
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickAdd(sessionConfig.key);
                          if (e.key === 'Escape') { setQuickAddSession(null); setQuickAddTitle(''); }
                        }}
                        autoFocus
                        className="tm-quick-add__input"
                      />
                      <div className="tm-quick-add__actions">
                        <button onClick={() => handleQuickAdd(sessionConfig.key)} className="btn-sm btn-primary">Add</button>
                        <button onClick={() => { setQuickAddSession(null); setQuickAddTitle(''); }} className="btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="tm-quick-add-trigger"
                      onClick={() => setQuickAddSession(sessionConfig.key)}
                      disabled={!!editing || showForm}
                    >
                      + Quick Add
                    </button>
                  )}

                  <div className="tm-slot__list">
                    {sessionTasks.length === 0 ? (
                      <div className="empty">No tasks for this session</div>
                    ) : (
                      sessionTasks.map(t => (
                        <TaskCard
                          key={t._id || t.id}
                          task={t}
                          showStatus
                          onToggleComplete={() => toggleComplete(t)}
                          onEdit={() => {
                            setFormSession((t.session || 'morning').toLowerCase());
                            setEditing(t);
                          }}
                          onDelete={() => handleDelete(t)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
