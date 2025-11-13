import React, { useEffect, useMemo, useState } from 'react';
import TaskCard from '../../../shared/components/time/TaskCard';
import TaskForm from '../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import usePlannerApi from '../hooks/usePlannerApi';
import useLocalSync from '../hooks/useLocalSync';
import useOwnerBusinesses from '../hooks/useOwnerBusinesses';
import '../styles/timeManager.css';

const SESSIONS = ['Morning', 'Afternoon', 'Evening'];

export default function DailyPlanner({ role = 'visitor' }) {
  const api = usePlannerApi({ role });
  const { options: assignmentSuggestions } = useOwnerBusinesses();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useLocalSync('tm.daily.tasks', tasks);

  const grouped = useMemo(() => {
    const out = { Morning: [], Afternoon: [], Evening: [] };
    for (const t of tasks) {
      out[t.session || 'Morning'].push(t);
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
    const updated = { status: task.status === 'completed' ? 'pending' : 'completed', completed: !(task.completed) };
    const res = await api.updateTask(task._id, updated);
    setTasks(prev => prev.map(t => (t._id === task._id ? res : t)));
  };

  const handleCreate = async (payload) => {
    const meta = payload.assignedTo ? { metadata: { assignedTo: payload.assignedTo } } : {};
    const created = await api.createTask({ ...payload, ...meta, date: selectedDate, scope: 'daily' });
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

  return (
    <div className="tm-daily">
      <div className="tm-head">
        <div className="tm-head__left">
          <h3>Daily Planner</h3>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        <div className="tm-head__right">
          <button className="btn-primary" onClick={() => setShowForm(true)} disabled={!!editing}>+ Add Task</button>
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
        <LoadingSpinner message="Loading today's tasks..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      ) : (
        <div className="tm-daily__grid">
          {SESSIONS.map((s) => (
            <div key={s} className="tm-slot">
              <div className="tm-slot__title">{s}</div>
              <div className="tm-slot__list">
                {grouped[s].length === 0 ? (
                  <div className="empty">No tasks</div>
                ) : (
                  grouped[s].map(t => (
                    <TaskCard key={t._id || t.id} task={t} showStatus onEdit={() => setEditing(t)} onDelete={() => handleDelete(t)} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
