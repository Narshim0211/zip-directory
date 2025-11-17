import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WeeklyGrid } from "../../components/CalendarGrid";
import AddTaskModal from "../../components/AddTaskModal";
import ProgressBar from "../../components/ProgressBar";
import ReminderList from "../../components/ReminderList";
import useTimeManagerApi from "../../hooks/useTimeManagerApi";
import "../../styles/timeManagerNew.css";
import "../../styles/reminderList.css";

export default function WeeklyView({ role = "visitor" }) {
  const api = useTimeManagerApi(role);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(date.setDate(diff));
  });

  const weekStartIso = useMemo(() => 
    currentWeekStart.toISOString().split('T')[0], 
    [currentWeekStart]
  );

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.fetchWeekly(weekStartIso);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Weekly load error:", error);
      setTasks([]);
    }
  }, [api, weekStartIso]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleTaskClick = (task) => {
    // TODO: Open task edit modal or inline editor
    console.log("Task clicked:", task);
  };

  const handleToggleComplete = async (task) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t._id === task._id ? { ...t, completed: !t.completed } : t
      ));
      
      await api.toggleComplete(task._id, { completed: !task.completed });
      await loadTasks(); // Refresh to get server state
    } catch (error) {
      console.error("Toggle complete error:", error);
      // Revert on error
      await loadTasks();
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      // Optimistically remove from UI
      setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
      
      await api.deleteTask(taskId);
      
      // Reload to ensure sync
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      // Reload on error to restore correct state
      loadTasks();
    }
  };

  const handleDateClick = (date) => {
    // Navigate to daily view for that date
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/${role}/time/daily?date=${dateStr}`);
  };

  const handleSubmit = async (payload) => {
    try {
      await api.createWeekly({
        ...payload,
        taskDate: selectedDate.toISOString(),
        scope: 'weekly'
      });
      setModalOpen(false);
      await loadTasks();
    } catch (error) {
      console.error("Create task error:", error);
    }
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const handleReminderDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await api.updateTask(taskId, { reminder: null });
      
      // Update tasks state immediately to sync UI
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId
            ? { ...task, reminder: null }
            : task
        )
      );
      
      // Also reload from backend to ensure sync
      await loadTasks();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      // Reload tasks even on error to ensure UI is in sync
      loadTasks();
    }
  };

  const handleReminderEdit = (task) => {
    setSelectedDate(new Date(task.taskDate));
    setModalOpen(true);
  };

  const completed = tasks.filter((t) => t.completed).length;
  const tasksWithReminders = tasks.filter((task) => task.reminder);
  
  const endOfWeek = useMemo(() => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 6);
    return date;
  }, [currentWeekStart]);

  const weekLabel = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="tm-section">
      <div className="tm-header">
        <div className="tm-header__nav">
          <button onClick={handlePrevWeek} className="tm-nav-btn">←</button>
          <h2 className="tm-header__title">{weekLabel}</h2>
          <button onClick={handleNextWeek} className="tm-nav-btn">→</button>
        </div>
      </div>
      
      <ProgressBar completed={completed} total={tasks.length || 1} />
      
      <WeeklyGrid 
        weekStart={currentWeekStart}
        tasks={tasks}
        onAddClick={handleAddTask}
        onTaskClick={handleTaskClick}
        onToggleComplete={handleToggleComplete}
        onDateClick={handleDateClick}
        onDelete={handleDelete}
        onDeleteReminder={handleReminderDelete}
      />
      
      <ReminderList
        reminders={tasksWithReminders}
        onEdit={handleReminderEdit}
        onDelete={handleReminderDelete}
      />
      
      <AddTaskModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSubmit}
        defaultDate={selectedDate}
        scope="weekly"
      />
    </div>
  );
}
