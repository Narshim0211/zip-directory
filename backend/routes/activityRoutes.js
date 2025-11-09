const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect, adminOnly } = require('../middleWare/authMiddleware');

// GET recent activity (optionally filter by type)
router.get('/recent', async (req, res) => {
  try {
    const { type } = req.query || {};
    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 50);
    const filter = {};
    if (type) filter.type = type;
    const items = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST activity (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = req.body || {};
    const doc = new Activity(payload);
    await doc.save();
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

