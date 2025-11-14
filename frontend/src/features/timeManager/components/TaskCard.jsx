import React from "react";
import "../styles/timeManagerNew.css";

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
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
        <div className="tm-task-card__badge">{task.priority || "medium"}</div>
      </div>
      <p className="tm-task-card__meta">
        {task.duration || 0} min • {task.session || "any"}
      </p>
      {task.reminderEnabled && <div className="tm-task-card__reminder">🔔 Reminder set</div>}
      <div className="tm-task-card__actions">
        {onEdit && (
          <button type="button" onClick={() => onEdit(task)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={() => onDelete(task)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
