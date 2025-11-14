import React, { useEffect, useMemo, useState } from 'react';
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

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useLocalSync('tm.monthly.tasks', tasks);

  // Group tasks by date
  const groupedByDate = useMemo(() => {
    const grouped = {};
    for (const task of tasks) {
      const taskDateStr = task.taskDate
        ? new Date(task.taskDate).toISOString().split('T')[0]
        : (task.date || '').split('T')[0];

      if (!grouped[taskDateStr]) {
        grouped[taskDateStr] = [];
      }
      grouped[taskDateStr].push(task);
    }
    return grouped;
  }, [tasks]);

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const grid = [];
    let dayCounter = 1;

    // Build weeks (rows)
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const cellIndex = week * 7 + dayOfWeek;

        if (cellIndex < startingDayOfWeek || dayCounter > daysInMonth) {
          weekDays.push(null); // Empty cell
        } else {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          weekDays.push({
            day: dayCounter,
            dateStr: dateStr,
            tasks: groupedByDate[dateStr] || []
          });
          dayCounter++;
        }
      }
      grid.push(weekDays);

      // Stop if we've filled all days
      if (dayCounter > daysInMonth) break;
    }

    return grid;
  }, [year, month, groupedByDate]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMonthly(month, year);
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
    try {
      // Use selectedDate if available, otherwise use first day of month
      const taskDate = selectedDate || `${year}-${String(month).padStart(2, '0')}-01`;

      const taskData = {
        ...payload,
        taskDate: taskDate,
        date: taskDate,
        session: payload.session?.toLowerCase() || 'morning',
        scopeTag: payload.scopeTag || payload.scope || 'monthly'
      };

      if (payload.assignedTo) {
        taskData.metadata = { assignedTo: payload.assignedTo };
      }

      const res = await api.createTask(taskData);
      const created = res.task || res;
      setTasks(prev => [...prev, created]);
      setShowForm(false);
      setSelectedDate(null);
      await load();
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

  const openInspector = (dateStr) => {
    setSelectedDate(dateStr);
    setInspectorOpen(true);
  };

  const closeInspector = () => {
    setInspectorOpen(false);
    setSelectedDate(null);
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
        <>
          {/* Calendar Grid */}
          <div className="tm-calendar">
            {/* Weekday headers */}
            <div className="tm-calendar__header">
              {WEEKDAY_LABELS.map(label => (
                <div key={label} className="tm-calendar__day-label">{label}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="tm-calendar__grid">
              {calendarGrid.map((week, weekIdx) => (
                <div key={weekIdx} className="tm-calendar__week">
                  {week.map((cell, dayIdx) => {
                    if (!cell) {
                      return <div key={dayIdx} className="tm-calendar__cell tm-calendar__cell--empty"></div>;
                    }

                    const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                    const hasTasksClass = cell.tasks.length > 0 ? 'tm-calendar__cell--has-tasks' : '';
                    const todayClass = isToday ? 'tm-calendar__cell--today' : '';

                    return (
                      <div
                        key={dayIdx}
                        className={`tm-calendar__cell ${hasTasksClass} ${todayClass}`}
                        onClick={() => openInspector(cell.dateStr)}
                      >
                        <div className="tm-calendar__day-number">{cell.day}</div>
                        {cell.tasks.length > 0 && (
                          <div className="tm-calendar__task-count">{cell.tasks.length} task{cell.tasks.length > 1 ? 's' : ''}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Inspector Drawer */}
          {inspectorOpen && selectedDate && (
            <div className="tm-inspector">
              <div className="tm-inspector__header">
                <h4>Tasks for {selectedDate}</h4>
                <button onClick={closeInspector} className="btn-close">×</button>
              </div>
              <div className="tm-inspector__body">
                {(groupedByDate[selectedDate] || []).length === 0 ? (
                  <div className="empty">No tasks for this date</div>
                ) : (
                  groupedByDate[selectedDate].map(task => (
                    <TaskCard
                      key={task._id || task.id}
                      task={task}
                      showStatus
                      onToggleComplete={() => toggleComplete(task)}
                      onEdit={() => setEditing(task)}
                      onDelete={() => handleDelete(task)}
                    />
                  ))
                )}
              </div>
              <div className="tm-inspector__footer">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowForm(true);
                    setInspectorOpen(false);
                  }}
                >
                  + Add Task for {selectedDate}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
