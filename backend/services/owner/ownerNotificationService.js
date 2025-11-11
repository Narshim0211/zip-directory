const Notification = require("../../models/Notification");

const listOwnerNotifications = async (ownerId, { limit = 20, before } = {}) => {
  const filter = { recipient: ownerId };
  if (before) {
    filter.createdAt = { $lt: new Date(before) };
  }
  const items = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
  const unread = await Notification.countDocuments({ ...filter, read: false });
  return { items, unread };
};

const markNotificationRead = async (ownerId, notificationId) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: ownerId },
    { read: true },
    { new: true }
  );
  if (!updated) {
    throw new Error("Notification not found");
  }
  return updated;
};

const markAllRead = async (ownerId) => {
  await Notification.updateMany({ recipient: ownerId, read: false }, { read: true });
};

module.exports = {
  listOwnerNotifications,
  markNotificationRead,
  markAllRead,
};
