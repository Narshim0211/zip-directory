import React, { useEffect, useMemo, useState } from "react";
import TaskCard from "../../components/TaskCard";
import AddTaskModal from "../../components/AddTaskModal";
import ProgressBar from "../../components/ProgressBar";
import ReminderList from "../../components/ReminderList";
import useTimeManagerApi from "../../hooks/useTimeManagerApi";
import "../../styles/timeManagerNew.css";
import "../../styles/reminderList.css";

const SESSIONS = ["morning", "afternoon", "evening"];

export default function DailyView({ role = "visitor" }) {
  const api = useTimeManagerApi(role);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.fetchDaily(new Date().toISOString().split("T")[0]);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Daily load error", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const grouped = useMemo(() => {
    return SESSIONS.reduce((acc, session) => {
      acc[session] = tasks.filter((task) => task.session === session);
      return acc;
    }, {});
  }, [tasks]);

  const handleComplete = async (task) => {
    await api.toggleComplete(task._id, { completed: !task.completed });
    loadTasks();
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

  const handleAdd = async (payload) => {
    await api.createDaily(payload);
    setShowModal(false);
    loadTasks();
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
    // Open modal with task data pre-filled
    setShowModal(true);
    // You can add edit mode state here if needed
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const tasksWithReminders = tasks.filter((task) => task.reminder);

  return (
    <div className="tm-section">
      <ProgressBar completed={completedCount} total={tasks.length || 1} />
      <div className="tm-grid">
        {SESSIONS.map((session) => (
          <div key={session}>
            <div className="tm-grid__header">
              <h4>{session}</h4>
              <button 
                className="tm-add-task-btn"
                onClick={() => setShowModal(true)}
              >
                + Add Task
              </button>
            </div>
            {grouped[session]?.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onToggleComplete={handleComplete}
                onDelete={handleDelete}
                onDeleteReminder={handleReminderDelete}
              />
            ))}
            {grouped[session]?.length === 0 && <p className="tm-empty">No tasks</p>}
          </div>
        ))}
      </div>
      
      <ReminderList
        reminders={tasksWithReminders}
        onEdit={handleReminderEdit}
        onDelete={handleReminderDelete}
      />
      
      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} onSave={handleAdd} />
    </div>
  );
}
