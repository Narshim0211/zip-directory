import api from "./axios";

const buildParams = (params = {}) => {
  const result = {};
  if (params.limit) result.limit = params.limit;
  if (params.before) result.before = params.before;
  if (params.unreadOnly) result.unreadOnly = params.unreadOnly;
  return result;
};

export const fetchNotifications = ({ limit, before, unreadOnly } = {}) =>
  api.get("/notifications", { params: buildParams({ limit, before, unreadOnly }) });

export const markNotificationRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);

export const markAllNotificationsRead = () => api.patch("/notifications/read-all");
