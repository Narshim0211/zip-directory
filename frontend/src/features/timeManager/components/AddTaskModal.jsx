import React, { useState } from "react";
import "../styles/timeManagerNew.css";

export default function AddTaskModal({ open, onClose, onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [session, setSession] = useState(initial?.session || "morning");
  const [duration, setDuration] = useState(initial?.duration || 30);
  const [priority, setPriority] = useState(initial?.priority || "medium");
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime || "");

  if (!open) return null;

  const handleSubmit = () => {
    onSave({
      title,
      description,
      session,
      duration,
      priority,
      reminderEnabled,
      reminderTime,
    });
  };

  return (
    <div className="tm-modal-overlay">
      <div className="tm-modal">
        <h3>{initial ? "Edit Task" : "Add Task"}</h3>
        <div className="tm-modal__body">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Session
            <select value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>
          <label>
            Duration (minutes)
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </label>
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
            Set Reminder
          </label>
          {reminderEnabled && (
            <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          )}
        </div>
        <div className="tm-modal__actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
