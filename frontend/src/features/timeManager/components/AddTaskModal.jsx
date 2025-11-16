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
  const [reminderEmail, setReminderEmail] = useState(initial?.reminderEmail || "");
  const [reminderPhone, setReminderPhone] = useState(initial?.reminderPhone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (reminderEnabled && !reminderTime) {
      newErrors.reminderTime = "Reminder time is required when reminder is enabled";
    }
    
    if (reminderEnabled && !reminderEmail.trim() && !reminderPhone.trim()) {
      newErrors.reminder = "Please provide at least an email or phone number for reminders";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        title,
        description,
        session,
        duration,
        priority,
        reminder: reminderEnabled
          ? {
              time: reminderTime,
              email: reminderEmail.trim() || null,
              phone: reminderPhone.trim() || null,
            }
          : null,
      };
      
      console.log("SUBMITTED DATA:", payload);
      await onSave(payload);
      
      // Reset form on success
      setTitle("");
      setDescription("");
      setSession("morning");
      setDuration(30);
      setPriority("medium");
      setReminderEnabled(false);
      setReminderTime("");
      setReminderEmail("");
      setReminderPhone("");
      setErrors({});
    } catch (error) {
      console.error("Error saving task:", error);
      setErrors({ submit: error.message || "Failed to save task" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tm-modal-overlay">
      <div className="tm-modal">
        <h3>{initial ? "Edit Task" : "Add Task"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="tm-modal__body">
            {errors.submit && (
              <div className="tm-error-message" style={{ color: 'red', marginBottom: '10px' }}>
                {errors.submit}
              </div>
            )}
            <label>
              Title *
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
              {errors.title && <span className="tm-field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
            </label>
            <label>
              Description
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <label>
              Session
              <select 
                value={session} 
                onChange={(e) => setSession(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </label>
            <label>
              Duration (minutes)
              <input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isSubmitting}
                min="1"
              />
            </label>
            <label>
              Priority
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                disabled={isSubmitting}
              />
              Set Reminder
            </label>
            {reminderEnabled && (
              <div className="tm-reminder__fields">
                {errors.reminder && (
                  <span className="tm-field-error" style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    {errors.reminder}
                  </span>
                )}
                <label>
                  Reminder Time *
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    disabled={isSubmitting}
                    required={reminderEnabled}
                  />
                  {errors.reminderTime && (
                    <span className="tm-field-error" style={{ color: 'red', fontSize: '12px' }}>
                      {errors.reminderTime}
                    </span>
                  )}
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    placeholder="+1 555 123 4567"
                    value={reminderPhone}
                    onChange={(e) => setReminderPhone(e.target.value)}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            )}
          </div>
          <div className="tm-modal__actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
