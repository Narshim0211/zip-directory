import React from 'react';
import './TaskCard.css';

const TaskCard = ({ 
  task = {}, 
  showAssignee = false, 
  showStatus = true,
  onEdit,
  onDelete 
}) => {
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-info">
          <h4 className="task-title">{task.title || task.name || 'Untitled Task'}</h4>
          {task.description && <p className="task-description">{task.description}</p>}
        </div>
        {task.priority && (
          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        )}
      </div>

      <div className="task-card-meta">
        {task.session && (
          <div className="meta-item">
            <span className="meta-label">Session:</span>
            <span className="meta-value">{task.session}</span>
          </div>
        )}
        {task.estimatedDuration && (
          <div className="meta-item">
            <span className="meta-label">Duration:</span>
            <span className="meta-value">{task.estimatedDuration}m</span>
          </div>
        )}
        {showStatus && task.status && (
          <div className="meta-item">
            <span className={`status-badge ${getStatusClass(task.status)}`}>
              {task.status}
            </span>
          </div>
        )}
        {showAssignee && task.assignedTo && (
          <div className="meta-item">
            <span className="meta-label">Assigned to:</span>
            <span className="meta-value">
              {task.assignedTo.firstName || task.assignedTo.name || task.assignedTo}
            </span>
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="task-card-actions">
          {onEdit && (
            <button onClick={() => onEdit(task)} className="btn-edit">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(task)} className="btn-delete">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
