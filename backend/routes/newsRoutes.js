const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { protect, adminOnly } = require('../middleWare/authMiddleware');

// GET latest news
router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '5', 10) || 5, 20);
    const items = await News.find().sort({ createdAt: -1 }).limit(limit);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET all news (basic paging + filters)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const [items, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET one news by id
router.get('/:id', async (req, res) => {
  try {
    const doc = await News.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// POST create news (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = req.body || {};
    const doc = new News(payload);
    await doc.save();
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

