import React from 'react';
import './TaskCard.css';

/**
 * TaskCard Component
 * Displays individual task with completion toggle, priority badge, and actions
 */
const TaskCard = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  readOnly = false
}) => {
  const {
    _id,
    task: title,
    description,
    session,
    priority,
    completed,
    reminder,
    metadata = {}
  } = task;

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#DC3545';
      case 'medium': return '#FFC107';
      case 'low': return '#28A745';
      default: return '#6C757D';
    }
  };

  const getSessionIcon = () => {
    switch (session) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '📅';
    }
  };

  return (
    <div
      className={`task-card ${completed ? 'task-card--completed' : ''}`}
      style={{
        borderLeft: `4px solid ${metadata.color || getPriorityColor()}`
      }}
    >
      <div className="task-card__header">
        <div className="task-card__left">
          {!readOnly && (
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggle(_id)}
              className="task-card__checkbox"
            />
          )}
          <span className="task-card__session">{getSessionIcon()}</span>
        </div>

        <div className="task-card__middle">
          <h4 className={`task-card__title ${completed ? 'task-card__title--completed' : ''}`}>
            {title}
          </h4>
          {description && (
            <p className="task-card__description">{description}</p>
          )}

          <div className="task-card__meta">
            <span
              className="task-card__priority"
              style={{ background: getPriorityColor() }}
            >
              {priority}
            </span>

            {reminder?.enabled && (
              <span className="task-card__reminder">
                {reminder.type === 'sms' ? '📱' : reminder.type === 'email' ? '📧' : '🔔'}
                {reminder.time}
              </span>
            )}

            {metadata.tags && metadata.tags.length > 0 && (
              <div className="task-card__tags">
                {metadata.tags.map((tag, index) => (
                  <span key={index} className="task-card__tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className="task-card__actions">
            <button
              onClick={() => onEdit(task)}
              className="task-card__btn task-card__btn--edit"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(_id)}
              className="task-card__btn task-card__btn--delete"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
