import React, { useEffect, useMemo, useState } from 'react';
import TaskCard from '../../../shared/components/time/TaskCard';
import TaskForm from '../../../shared/components/time/TaskForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import usePlannerApi from '../hooks/usePlannerApi';
import useLocalSync from '../hooks/useLocalSync';
import useOwnerBusinesses from '../hooks/useOwnerBusinesses';
import '../styles/timeManager.css';

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const WEEK_DAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' }
];

export default function WeeklyPlanner({ role = 'visitor' }) {
  const api = usePlannerApi({ role });
  const { options: assignmentSuggestions } = useOwnerBusinesses();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useLocalSync('tm.weekly.tasks', tasks);

  const grouped = useMemo(() => {
    const out = {};
    WEEK_DAYS.forEach((_, i) => { out[addDays(weekStart, i)] = []; });
    for (const t of tasks) {
      // Use taskDate if available, fallback to date
      const taskDateStr = t.taskDate ? new Date(t.taskDate).toISOString().split('T')[0] :
                          (t.date || '').split('T')[0];
      const key = taskDateStr || addDays(weekStart, 0);
      if (out[key]) {
        out[key].push(t);
      }
    }
    return out;
  }, [tasks, weekStart]);

  const rangeLabel = () => {
    const end = addDays(weekStart, 6);
    return `${weekStart} → ${end}`;
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWeekly(weekStart);
      const arr = Array.isArray(data) ? data : data?.tasks || [];
      setTasks(arr);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [weekStart]);

  const toggleComplete = async (task) => {
    try {
      const updated = { completed: !(task.completed) };
      const res = await api.updateTask(task._id, updated);
      const updatedTask = res.task || res;
      setTasks(prev => prev.map(t => (t._id === task._id ? updatedTask : t)));
    } catch (error) {
      console.error('Failed to toggle task:', error);
      alert('Failed to update task');
    }
  };

  const handleCreate = async (payload) => {
    try {
      // Determine the taskDate - use payload.taskDate if provided, otherwise use weekStart
      const taskDate = payload.taskDate || payload.date || weekStart;

      const taskData = {
        ...payload,
        taskDate: taskDate,
        date: taskDate,
        session: payload.session?.toLowerCase() || 'morning',
        scopeTag: payload.scopeTag || payload.scope || 'weekly'
      };

      // Add assignment metadata if owner role
      if (payload.assignedTo) {
        taskData.metadata = { assignedTo: payload.assignedTo };
      }

      const res = await api.createTask(taskData);
      const created = res.task || res;
      setTasks(prev => [...prev, created]);
      setShowForm(false);
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

      // Preserve assignment metadata if owner role
      if (payload.assignedTo) {
        updates.metadata = { ...(editing.metadata || {}), assignedTo: payload.assignedTo };
      }

      const res = await api.updateTask(editing._id, updates);
      const updated = res.task || res;
      setTasks(prev => prev.map(t => (t._id === editing._id ? updated : t)));
      setEditing(null);
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

  return (
    <div className="tm-weekly">
      <div className="tm-head">
        <div className="tm-head__left">
          <h3>Weekly Planner</h3>
          <div>{rangeLabel()}</div>
        </div>
        <div className="tm-head__right">
          <button className="btn-primary" onClick={() => setShowForm(true)} disabled={!!editing}>+ Add Task</button>
          <button onClick={() => setWeekStart(addDays(weekStart, -7))}>{'<'}</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))}>{'>'}</button>
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
        <LoadingSpinner message="Loading weekly tasks..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      ) : (
        <div className="tm-daily__grid">
          {WEEK_DAYS.map((dayConfig, idx) => {
            const dateKey = addDays(weekStart, idx);
            const dayTasks = grouped[dateKey] || [];
            return (
              <div key={dateKey} className="tm-slot">
                <div className="tm-slot__title">
                  <span>{dayConfig.short} - {dateKey}</span>
                  <span className="tm-slot__count">({dayTasks.length})</span>
                </div>
                <div className="tm-slot__list">
                  {dayTasks.length === 0 ? (
                    <div className="empty">No tasks</div>
                  ) : (
                    dayTasks.map(t => (
                      <TaskCard
                        key={t._id || t.id}
                        task={t}
                        showStatus
                        onToggleComplete={() => toggleComplete(t)}
                        onEdit={() => setEditing(t)}
                        onDelete={() => handleDelete(t)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
