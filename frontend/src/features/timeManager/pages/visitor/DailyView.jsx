import React, { useEffect, useMemo, useState } from "react";
import TaskCard from "../../components/TaskCard";
import AddTaskModal from "../../components/AddTaskModal";
import ProgressBar from "../../components/ProgressBar";
import useTimeManagerApi from "../../hooks/useTimeManagerApi";
import "../../styles/timeManagerNew.css";

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

  const handleAdd = async (payload) => {
    await api.createDaily(payload);
    setShowModal(false);
    loadTasks();
  };

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="tm-section">
      <ProgressBar completed={completedCount} total={tasks.length || 1} />
      <div className="tm-grid">
        {SESSIONS.map((session) => (
          <div key={session}>
            <div className="tm-grid__header">
              <h4>{session}</h4>
              <button className="btn-sm" onClick={() => setShowModal(true)}>
                + Task
              </button>
            </div>
            {grouped[session]?.map((task) => (
              <TaskCard key={task._id} task={task} onToggleComplete={handleComplete} />
            ))}
            {grouped[session]?.length === 0 && <p className="tm-empty">No tasks</p>}
          </div>
        ))}
      </div>
      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} onSave={handleAdd} />
    </div>
  );
}
