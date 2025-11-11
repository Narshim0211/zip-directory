const ownerNotificationService = require("../../services/owner/ownerNotificationService");

const listNotifications = async (req, res) => {
  const { limit, before } = req.query;
  const data = await ownerNotificationService.listOwnerNotifications(req.user._id, {
    limit: Number(limit) || 20,
    before,
  });
  res.json(data);
};

const markRead = async (req, res) => {
  await ownerNotificationService.markNotificationRead(req.user._id, req.params.id);
  res.json({ ok: true });
};

const markAll = async (req, res) => {
  await ownerNotificationService.markAllRead(req.user._id);
  res.json({ ok: true });
};

module.exports = { listNotifications, markRead, markAll };
