import React from "react";
import "../styles/timeManagerNew.css";

export default function ReminderList({ reminders, onEdit, onDelete, onToggle }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="tm-reminders-section">
        <h3 className="tm-reminders-section__title">
          <span className="tm-reminders-section__icon">🔔</span>
          Reminders
        </h3>
        <p className="tm-reminders-section__empty">No reminders set for this period</p>
      </div>
    );
  }

  // Sort reminders by time
  const sortedReminders = [...reminders].sort((a, b) => {
    const timeA = a.reminder?.time || "";
    const timeB = b.reminder?.time || "";
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="tm-reminders-section">
      <h3 className="tm-reminders-section__title">
        <span className="tm-reminders-section__icon">🔔</span>
        Reminders
        <span className="tm-reminders-section__count">({reminders.length})</span>
      </h3>

      <div className="tm-reminders-list">
        {sortedReminders.map((task) => {
          const { reminder } = task;
          
          // Safety checks
          if (!reminder || !task._id) {
            return null;
          }

          // Format time for display (HH:MM to 12-hour format)
          const formatTime = (time) => {
            if (!time || typeof time !== 'string') return "—";
            const parts = time.split(":");
            if (parts.length !== 2) return time; // Return as-is if invalid format
            const [hours, minutes] = parts;
            const hour = parseInt(hours);
            if (isNaN(hour)) return time;
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
          };

          // Check if reminder is overdue (for current day only)
          const isOverdue = () => {
            if (!reminder?.time || typeof reminder.time !== 'string') return false;
            const parts = reminder.time.split(":");
            if (parts.length !== 2) return false;
            const [hours, minutes] = parts;
            const hour = parseInt(hours);
            const minute = parseInt(minutes);
            if (isNaN(hour) || isNaN(minute)) return false;
            
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(hour, minute, 0);
            return reminderTime < now;
          };

          const overdueClass = isOverdue() ? "tm-reminder-card--overdue" : "";

          return (
            <div key={task._id} className={`tm-reminder-card ${overdueClass}`}>
              <div className="tm-reminder-card__main">
                <div className="tm-reminder-card__info">
                  <div className="tm-reminder-card__header">
                    <h4 className="tm-reminder-card__task-title">{task.title}</h4>
                    <span className="tm-reminder-card__time">
                      ⏰ {formatTime(reminder.time)}
                    </span>
                  </div>
                  
                  {task.session && (
                    <span className={`tm-reminder-card__session tm-reminder-card__session--${task.session}`}>
                      {task.session.charAt(0).toUpperCase() + task.session.slice(1)}
                    </span>
                  )}

                  <div className="tm-reminder-card__contacts">
                    <div className="tm-reminder-card__contact">
                      <span className="tm-reminder-card__contact-icon">📧</span>
                      <span className="tm-reminder-card__contact-value">
                        {reminder.email || "—"}
                      </span>
                    </div>
                    <div className="tm-reminder-card__contact">
                      <span className="tm-reminder-card__contact-icon">📱</span>
                      <span className="tm-reminder-card__contact-value">
                        {reminder.phone || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tm-reminder-card__actions">
                  {onToggle && (
                    <button
                      type="button"
                      className="tm-reminder-card__action tm-reminder-card__action--toggle"
                      onClick={() => onToggle(task._id)}
                      title="Disable reminder"
                    >
                      🔕
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      className="tm-reminder-card__action tm-reminder-card__action--edit"
                      onClick={() => onEdit(task)}
                      title="Edit reminder"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="tm-reminder-card__action tm-reminder-card__action--delete"
                      onClick={() => onDelete(task._id)}
                      title="Delete reminder"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>

              {isOverdue() && (
                <div className="tm-reminder-card__overdue-badge">
                  ⚠️ Overdue
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
