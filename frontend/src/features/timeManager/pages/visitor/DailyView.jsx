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
  console.log(`🎯 [DailyView] Component mounted with role: ${role}`);
  
  const api = useTimeManagerApi(role);
  console.log(`🔧 [DailyView] API hook initialized:`, api);
  
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    console.log('🔄 [FRONTEND] Loading daily tasks for role:', role);
    setLoading(true);
    try {
      const data = await api.fetchDaily(new Date().toISOString().split("T")[0]);
      console.log('📥 [FRONTEND] Received tasks:', data);
      const tasksArray = Array.isArray(data) ? data : [];
      console.log(`✅ [FRONTEND] Setting ${tasksArray.length} tasks in state`);
      setTasks(tasksArray);
    } catch (error) {
      console.error("❌ [FRONTEND] Daily load error", error.response?.data || error.message);
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
    console.log('🎯 [DailyView.handleAdd] START - Creating task with role:', role);
    console.log('📦 [DailyView.handleAdd] Payload:', JSON.stringify(payload, null, 2));
    console.log('🔍 [DailyView.handleAdd] API object:', api);
    console.log('🔍 [DailyView.handleAdd] api.createDaily function:', typeof api.createDaily);
    
    if (!api || !api.createDaily) {
      console.error('❌ [DailyView.handleAdd] CRITICAL: API or createDaily is undefined!');
      alert('Error: API not initialized properly. Check console for details.');
      return;
    }
    
    try {
      console.log('📤 [DailyView.handleAdd] Calling api.createDaily...');
      const result = await api.createDaily(payload);
      console.log('✅ [DailyView.handleAdd] Task created successfully:', result);
      setShowModal(false);
      await loadTasks();
    } catch (error) {
      console.error('❌ [DailyView.handleAdd] Failed to create task:', error);
      console.error('❌ [DailyView.handleAdd] Error response:', error.response?.data);
      console.error('❌ [DailyView.handleAdd] Error message:', error.message);
      alert(`Failed to create task: ${error.response?.data?.message || error.message}`);
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
                onClick={() => {
                  console.log('🖱️ [DailyView] Add Task button clicked for session:', session);
                  console.log('🔍 [DailyView] Current role:', role);
                  setShowModal(true);
                }}
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
