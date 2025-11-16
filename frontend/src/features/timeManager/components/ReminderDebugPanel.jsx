import React, { useEffect, useState } from "react";
import useTimeManagerApi from "../hooks/useTimeManagerApi";

/**
 * Debug component to diagnose reminder data flow
 * Add this temporarily to your DailyView to see what's happening
 */
export default function ReminderDebugPanel({ role = "visitor" }) {
  const api = useTimeManagerApi(role);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkReminders = async () => {
    setLoading(true);
    try {
      const date = new Date().toISOString().split("T")[0];
      const data = await api.fetchDaily(date);
      const tasks = Array.isArray(data) ? data : [];

      const info = {
        totalTasks: tasks.length,
        tasksWithReminderField: tasks.filter((t) => "reminder" in t).length,
        tasksWithNonNullReminder: tasks.filter((t) => t.reminder !== null).length,
        tasksWithValidReminder: tasks.filter(
          (t) => t.reminder && t.reminder.time
        ).length,
        tasks: tasks.map((t) => ({
          _id: t._id,
          title: t.title,
          hasReminderField: "reminder" in t,
          reminderValue: t.reminder,
          reminderType: typeof t.reminder,
        })),
      };

      setDebugInfo(info);
      console.log("🔍 FULL DIAGNOSTIC:", info);
    } catch (error) {
      console.error("Debug check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkReminders();
  }, []);

  if (!debugInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "#1a1a1a",
        color: "#fff",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "400px",
        maxHeight: "80vh",
        overflow: "auto",
        zIndex: 9999,
        fontFamily: "monospace",
        fontSize: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, color: "#4ade80" }}>🔍 Reminder Debug</h3>
        <button
          onClick={checkReminders}
          disabled={loading}
          style={{
            background: "#3b82f6",
            color: "white",
            border: "none",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <div style={{ color: "#94a3b8", marginBottom: "5px" }}>Summary:</div>
        <div style={{ color: "#fff" }}>
          📊 Total tasks: <strong>{debugInfo.totalTasks}</strong>
        </div>
        <div style={{ color: debugInfo.tasksWithReminderField > 0 ? "#4ade80" : "#ef4444" }}>
          📋 Tasks with reminder field:{" "}
          <strong>{debugInfo.tasksWithReminderField}</strong>
        </div>
        <div style={{ color: debugInfo.tasksWithNonNullReminder > 0 ? "#4ade80" : "#ef4444" }}>
          ✅ Non-null reminders: <strong>{debugInfo.tasksWithNonNullReminder}</strong>
        </div>
        <div style={{ color: debugInfo.tasksWithValidReminder > 0 ? "#4ade80" : "#ef4444" }}>
          🎯 Valid reminders (with time):{" "}
          <strong>{debugInfo.tasksWithValidReminder}</strong>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #333", paddingTop: "10px" }}>
        <div style={{ color: "#94a3b8", marginBottom: "5px" }}>Tasks Details:</div>
        {debugInfo.tasks.map((task, i) => (
          <div
            key={i}
            style={{
              background: "#252525",
              padding: "8px",
              borderRadius: "4px",
              marginBottom: "8px",
            }}
          >
            <div style={{ color: "#60a5fa", marginBottom: "4px" }}>
              {i + 1}. {task.title}
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>
              ID: {task._id?.substring(0, 8)}...
            </div>
            <div style={{ fontSize: "10px", color: task.hasReminderField ? "#4ade80" : "#ef4444" }}>
              Has reminder field: {task.hasReminderField ? "YES" : "NO"}
            </div>
            <div style={{ fontSize: "10px", color: task.reminderValue ? "#4ade80" : "#ef4444" }}>
              Reminder type: {task.reminderType}
            </div>
            {task.reminderValue && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#fbbf24",
                  marginTop: "4px",
                  whiteSpace: "pre-wrap",
                }}
              >
                Value: {JSON.stringify(task.reminderValue, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #333", paddingTop: "10px", marginTop: "10px" }}>
        <div style={{ color: "#94a3b8", fontSize: "10px" }}>
          Check browser console for detailed logs
        </div>
      </div>
    </div>
  );
}
