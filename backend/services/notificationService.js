const Notification = require('../models/Notification');
const notificationSocket = require('./notificationSocket');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const notifyUser = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message = '',
  contentType = 'post',
  contentId = null,
  link = '',
}) => {
  if (!recipientId) throw new Error('recipientId is required to send a notification');
  if (!type) throw new Error('type is required to send a notification');
  if (!title) throw new Error('title is required for a notification');

  const payload = {
    recipient: recipientId,
    user: String(recipientId),
    sender: senderId,
    type,
    contentType,
    contentId,
    title,
    message,
    link,
  };

  const created = await Notification.create(payload);
  notificationSocket.emitNotification(String(recipientId), created);
  return created;
};

const listNotifications = async (userId, { limit = DEFAULT_LIMIT, unreadOnly = false, before } = {}) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const filter = { user: String(userId) };
  if (unreadOnly) filter.read = false;
  if (before) {
    const beforeDate = new Date(before);
    if (!Number.isNaN(beforeDate.getTime())) {
      filter.createdAt = { $lt: beforeDate };
    }
  }

  const items = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(safeLimit);
  const unread = await Notification.countDocuments({ user: String(userId), read: false });

  return { items, unread };
};

const markAsRead = async (userId, notificationId) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, user: String(userId) },
    { read: true },
    { new: true }
  );
  if (!updated) throw new Error('Notification not found');
  return updated;
};

const markAllRead = async (userId) => {
  await Notification.updateMany({ user: String(userId), read: false }, { read: true });
};

const notifyOwnerEngagement = async ({
  ownerId,
  senderId = null,
  type,
  title,
  message = "",
  contentType = "post",
  contentId = null,
  link = "",
}) => {
  if (!ownerId) throw new Error("ownerId is required for owner notifications");
  return notifyUser({
    recipientId: ownerId,
    senderId,
    type,
    title,
    message,
    contentType,
    contentId,
    link,
  });
};

module.exports = {
  notifyUser,
  listNotifications,
  markAsRead,
  markAllRead,
  notifyOwnerEngagement,
};
