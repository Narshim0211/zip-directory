import React, { useCallback, useEffect, useRef, useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import '../styles/notifications.css';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { fetchNotifications, markNotificationRead } from '../api/notifications';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchNotifications({ limit: 6 });
      setNotifications(data.items || []);
      setUnread(data.unread || 0);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [open]);

  const handleIncomingNotification = useCallback((payload) => {
    setNotifications((prev) => {
      if (prev.some((item) => item._id === payload._id)) return prev;
      return [payload, ...prev].slice(0, 6);
    });
    setUnread((prev) => prev + (payload.read ? 0 : 1));
  }, []);

  useNotificationSocket(handleIncomingNotification);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        className="notification-bell__button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="Show notifications"
      >
        <span role="img" aria-hidden="true">
          🔔
        </span>
        {unread > 0 && <span className="notification-bell__badge">{unread}</span>}
      </button>
      {open && (
        <NotificationDropdown
          items={notifications}
          unread={unread}
          loading={loading}
          onMarkRead={(id) => {
            markAsRead(id);
          }}
          onRefresh={loadNotifications}
        />
      )}
    </div>
  );
};

export default NotificationBell;
