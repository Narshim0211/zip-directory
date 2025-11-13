import React, { useEffect, useState } from 'react';
import TaskCard from '../../../shared/components/time/TaskCard';
import TaskForm from '../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import usePlannerApi from '../hooks/usePlannerApi';
import useLocalSync from '../hooks/useLocalSync';
import useOwnerBusinesses from '../hooks/useOwnerBusinesses';
import '../styles/timeManager.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyPlanner({ role = 'visitor' }) {
  const api = usePlannerApi({ role });
  const { options: assignmentSuggestions } = useOwnerBusinesses();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useLocalSync('tm.monthly.tasks', tasks);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use monthly endpoint if available, else fall back to daily range query
      const data = await api.getMonthly ? api.getMonthly(month, year) : [];
      const arr = Array.isArray(data) ? data : data?.tasks || [];
      setTasks(arr);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load monthly tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [month, year]);

  const handleCreate = async (payload) => {
    const meta = payload.assignedTo ? { metadata: { assignedTo: payload.assignedTo } } : {};
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const created = await api.createTask({ ...payload, ...meta, date: firstDay, scope: 'monthly' });
    setTasks(prev => [created, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (payload) => {
    const updates = payload.assignedTo
      ? { ...payload, metadata: { ...(editing.metadata || {}), assignedTo: payload.assignedTo } }
      : payload;
    const res = await api.updateTask(editing._id, updates);
    setTasks(prev => prev.map(t => (t._id === editing._id ? res : t)));
    setEditing(null);
  };

  const handleDelete = async (task) => {
    if (!window.confirm('Delete this task?')) return;
    await api.deleteTask(task._id);
    setTasks(prev => prev.filter(t => t._id !== task._id));
  };

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  return (
    <div className="tm-monthly">
      <div className="tm-head">
        <div className="tm-head__left">
          <h3>Monthly Overview</h3>
          <div>{MONTHS[month - 1]} {year}</div>
        </div>
        <div className="tm-head__right">
          <button className="btn-primary" onClick={() => setShowForm(true)} disabled={!!editing}>+ Add Task</button>
          <button onClick={goToPrevMonth}>{'<'}</button>
          <button onClick={goToNextMonth}>{'>'}</button>
        </div>
      </div>

      {(showForm || editing) && (
        <div className="tm-form-wrap">
          <TaskForm
            initialData={editing || {}}
            mode={editing ? 'edit' : 'create'}
            showAssigned={role === 'owner'}
            assignmentSuggestions={role === 'owner' ? assignmentSuggestions : []}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading monthly tasks..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      ) : (
        <div className="tm-monthly__list">
          {tasks.length === 0 ? (
            <div className="empty">No tasks for {MONTHS[month - 1]} {year}</div>
          ) : (
            tasks.map(t => (
              <TaskCard key={t._id || t.id} task={t} showStatus onEdit={() => setEditing(t)} onDelete={() => handleDelete(t)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
