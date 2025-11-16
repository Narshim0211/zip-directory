import React from "react";
import "../styles/timeManagerNew.css";

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, onDeleteReminder }) {
  return (
    <div className={`tm-task-card${task.completed ? " tm-task-card--completed" : ""}`}>
      <div className="tm-task-card__top">
        <label>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete && onToggleComplete(task)}
          />
          <span className="tm-task-card__title">{task.title}</span>
        </label>
        <div className="tm-task-card__right">
          <div className="tm-task-card__badge">{task.priority || "medium"}</div>
          {onDelete && (
            <button
              type="button"
              className="tm-task-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              title="Delete task"
              aria-label="Delete task"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <p className="tm-task-card__meta">
        {task.duration || 0} min • {task.session || "any"}
      </p>
      {task.reminder && (
        <div className="tm-task-card__reminder">
          🔔 Reminder set
          {onDeleteReminder && (
            <button
              type="button"
              className="tm-reminder-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReminder(task._id);
              }}
              title="Delete reminder"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
