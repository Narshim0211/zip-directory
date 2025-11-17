import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MonthlyGrid } from "../../components/CalendarGrid";
import AddTaskModal from "../../components/AddTaskModal";
import ProgressBar from "../../components/ProgressBar";
import ReminderList from "../../components/ReminderList";
import useTimeManagerApi from "../../hooks/useTimeManagerApi";
import "../../styles/timeManagerNew.css";
import "../../styles/reminderList.css";

export default function MonthlyView({ role = "visitor" }) {
  const api = useTimeManagerApi(role);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.fetchMonthly(currentMonth, currentYear);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Monthly load error:", error);
      setTasks([]);
    }
  }, [api, currentMonth, currentYear]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleDateClick = (date) => {
    // Navigate to daily view for that date
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/${role}/time/daily?date=${dateStr}`);
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

  const handleSubmit = async (payload) => {
    try {
      await api.createMonthly({
        ...payload,
        taskDate: selectedDate.toISOString(),
        scope: 'monthly'
      });
      setModalOpen(false);
      await loadTasks();
    } catch (error) {
      console.error("Create task error:", error);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
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
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const monthLabel = `${monthNames[currentMonth - 1]} ${currentYear}`;

  return (
    <div className="tm-section">
      <div className="tm-header">
        <div className="tm-header__nav">
          <button onClick={handlePrevMonth} className="tm-nav-btn">←</button>
          <h2 className="tm-header__title">{monthLabel}</h2>
          <button onClick={handleNextMonth} className="tm-nav-btn">→</button>
        </div>
      </div>
      
      <ProgressBar completed={completed} total={tasks.length || 1} />
      
      <MonthlyGrid 
        month={currentMonth}
        year={currentYear}
        tasks={tasks}
        onAddClick={handleAddTask}
        onDateClick={handleDateClick}
        onTaskClick={handleTaskClick}
        onToggleComplete={handleToggleComplete}
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
        scope="monthly"
      />
    </div>
  );
}
