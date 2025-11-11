import React from 'react';
import '../styles/notifications.css';

const NotificationDropdown = ({ items = [], unread = 0, loading, onMarkRead, onRefresh }) => {
  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown__header">
        <span>Notifications {unread ? `(${unread} unread)` : ''}</span>
        <button type="button" onClick={onRefresh}>Refresh</button>
      </div>
      <div className="notification-dropdown__list">
        {loading ? (
          <div className="notification-dropdown__empty">Loading…</div>
        ) : items.length === 0 ? (
          <div className="notification-dropdown__empty">You’re all caught up.</div>
        ) : (
          items.map(item => (
            <div key={item._id} className={`notification-item${item.read ? ' is-read' : ''}`}>
              <div className="notification-item__content">
                <strong>{item.title}</strong>
                <p>{item.message || 'Tap to open'}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              <div className="notification-item__actions">
                {!item.read && (
                  <button type="button" onClick={() => onMarkRead(item._id)}>Mark read</button>
                )}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    Open
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <a className="notification-dropdown__view-all" href="/dashboard/owner">View all</a>
    </div>
  );
};

export default NotificationDropdown;
