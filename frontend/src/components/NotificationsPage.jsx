import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import useNotificationSocket from "../hooks/useNotificationSocket";
import "../styles/notificationsPage.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions", types: ["reply", "new_comment", "comment_report"] },
  { id: "likes", label: "Likes", types: ["like"] },
  { id: "reviews", label: "Reviews", types: ["new_review", "review_reply", "review_removal"] },
  { id: "surveys", label: "Surveys", types: ["new_survey"] },
  { id: "system", label: "System", types: ["system_announcement"] },
];

const BATCH_SIZE = 24;

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const delta = Date.now() - new Date(timestamp).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return "Just now";
  if (delta < hour) return `${Math.floor(delta / minute)}m ago`;
  if (delta < day) return `${Math.floor(delta / hour)}h ago`;
  if (delta < day * 7) return `${Math.floor(delta / day)}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async ({ before } = {}) => {
    if (before) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await fetchNotifications({ limit: BATCH_SIZE, before });
      const items = data.items || [];
      setHasMore(items.length === BATCH_SIZE);
      if (items.length > 0) {
        setCursor(items[items.length - 1].createdAt);
      }

      setNotifications((prev) => (before ? [...prev, ...items] : items));
      setUnreadCount(data.unread || 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      if (before) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = useCallback(
    async (notificationId) => {
      try {
        await markNotificationRead(notificationId);
        setNotifications((prev) =>
          prev.map((item) => (item._id === notificationId ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (error) {
        console.error("Unable to mark notification read", error);
      }
    },
    []
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!unreadCount) return;
    setLoading(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Unable to mark all notifications read", error);
    } finally {
      setLoading(false);
    }
  }, [unreadCount]);

  const handleView = useCallback(
    async (notification) => {
      if (!notification) return;
      if (!notification.read) {
        await handleMarkRead(notification._id);
      }
      if (notification.link) {
        if (notification.link.startsWith("http")) {
          window.open(notification.link, "_blank");
        } else {
          navigate(notification.link);
        }
      }
    },
    [handleMarkRead, navigate]
  );

  const handleIncomingNotification = useCallback((payload) => {
    setNotifications((prev) => {
      if (prev.some((item) => item._id === payload._id)) return prev;
      return [payload, ...prev];
    });
    setUnreadCount((prev) => prev + (payload.read ? 0 : 1));
  }, []);

  useNotificationSocket(handleIncomingNotification);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    const entry = FILTERS.find((item) => item.id === filter);
    if (!entry?.types) return notifications;
    return notifications.filter((item) => entry.types.includes(item.type));
  }, [filter, notifications]);

  return (
    <section className="notifications-page">
        <header className="notifications-page__header">
          <div>
            <h1>Notifications</h1>
            <p className="notifications-page__header-subtitle">
              {unreadCount ? `${unreadCount} unread` : "You are all caught up."}
            </p>
          </div>
          <button
            type="button"
            className="notifications-page__mark-all"
            onClick={handleMarkAllRead}
            disabled={!unreadCount || loading}
          >
            Mark all as read
          </button>
        </header>

        <div className="notifications-page__filters">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              className={`notifications-page__filter${
                filter === item.id ? " notifications-page__filter--active" : ""
              }`}
              type="button"
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="notifications-page__list">
          {loading ? (
            <div className="notifications-page__empty">Loading notifications…</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-page__empty">No notifications yet.</div>
          ) : (
            filteredNotifications.map((notification) => (
              <article
                key={notification._id}
                className={`notifications-page__card${
                  notification.read ? "" : " notifications-page__card--unread"
                }`}
              >
                <div className="notifications-page__card-avatar">
                  {notification.title?.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="notifications-page__card-body">
                  <strong>{notification.title}</strong>
                  <p>{notification.message || "Tap to open"}</p>
                  <span>{formatTimeAgo(notification.createdAt)}</span>
                </div>
                <div className="notifications-page__card-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      className="notifications-page__card-action notifications-page__card-action--muted"
                      onClick={() => handleMarkRead(notification._id)}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    className="notifications-page__card-action"
                    onClick={() => handleView(notification)}
                  >
                    View
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {hasMore && (
          <div class="notifications-page__load-more">
            <button
              type="button"
              onClick={() => loadNotifications({ before: cursor })}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : "Load more notifications"}
            </button>
          </div>
        )}
      </section>
  );
};

export default NotificationsPage;
