import React from 'react';
import './DailySessions.css';

const DailySessions = ({
  tasks = [],
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
  onAddTask
}) => {
  const sessions = ['Morning', 'Afternoon', 'Evening'];

  const getTasksForSession = (session) => {
    return tasks.filter(task =>
      task.session?.toLowerCase() === session.toLowerCase()
    );
  };

  const getSessionIcon = (session) => {
    switch(session.toLowerCase()) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '📋';
    }
  };

  const handleCheckboxChange = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    if (onTaskComplete) {
      await onTaskComplete(task._id, newStatus);
    }
  };

  return (
    <div className="daily-sessions">
      {sessions.map(session => {
        const sessionTasks = getTasksForSession(session);

        return (
          <div key={session} className="session-block">
            <div className="session-header">
              <div className="session-title">
                <span className="session-icon">{getSessionIcon(session)}</span>
                <h3>{session}</h3>
                <span className="task-count">({sessionTasks.length})</span>
              </div>
              <button
                className="btn-add-task"
                onClick={() => onAddTask(session)}
                title={`Add task to ${session}`}
              >
                <span>+</span> Add Task
              </button>
            </div>

            <div className="session-tasks">
              {sessionTasks.length === 0 ? (
                <div className="empty-session">
                  <p>No tasks for {session.toLowerCase()}</p>
                  <button
                    className="btn-add-first"
                    onClick={() => onAddTask(session)}
                  >
                    + Add your first task
                  </button>
                </div>
              ) : (
                <div className="tasks-list">
                  {sessionTasks.map(task => (
                    <div
                      key={task._id || task.id}
                      className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
                    >
                      <div className="task-checkbox">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => handleCheckboxChange(task)}
                          id={`task-${task._id}`}
                        />
                        <label htmlFor={`task-${task._id}`} className="checkbox-custom"></label>
                      </div>

                      <div className="task-content" onClick={() => onTaskEdit(task)}>
                        <div className="task-title-row">
                          <h4 className="task-title">{task.title}</h4>
                          {task.priority && (
                            <span className={`priority-badge priority-${task.priority}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                        <div className="task-meta">
                          {task.estimatedDuration && (
                            <span className="meta-duration">⏱️ {task.estimatedDuration}min</span>
                          )}
                        </div>
                      </div>

                      <div className="task-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskEdit(task);
                          }}
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskDelete(task._id);
                          }}
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailySessions;
