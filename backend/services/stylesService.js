const StyleInspiration = require('../models/StyleInspiration');

async function listForUser(userId) {
  return StyleInspiration.find({ user: userId }).sort({ createdAt: -1 });
}

async function createEntry(userId, payload) {
  const { imageUrl, note, tags } = payload || {};
  if (!imageUrl || !String(imageUrl).trim()) {
    const err = new Error('Image URL is required');
    err.status = 400;
    throw err;
  }
  const entry = new StyleInspiration({
    user: userId,
    imageUrl: String(imageUrl).trim(),
    note: note || '',
    tags: Array.isArray(tags) ? tags : [],
  });
  return entry.save();
}

async function deleteEntry(userId, id) {
  const entry = await StyleInspiration.findById(id);
  if (!entry) {
    const err = new Error('Style not found');
    err.status = 404;
    throw err;
  }
  if (String(entry.user) !== String(userId)) {
    const err = new Error('Not authorized to delete this inspiration');
    err.status = 403;
    throw err;
  }
  await entry.deleteOne();
  return { ok: true };
}

module.exports = { listForUser, createEntry, deleteEntry };
