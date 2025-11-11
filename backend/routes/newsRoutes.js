const createRouter = require('./asyncRouter');
const router = createRouter();
const News = require('../models/News');
const { fetchBeautyNews } = require('../services/newsService');
const newsController = require('../controllers/newsController');
const { protect, adminOnly } = require('../middleWare/authMiddleware');

const sanitizeLimit = (value, fallback = 15, max = 50) => {
  const numeric = parseInt(value || String(fallback), 10);
  if (Number.isNaN(numeric)) return fallback;
  return Math.min(Math.max(numeric, 1), max);
};

router.get('/latest', async (req, res) => {
  try {
    const limit = sanitizeLimit(req.query.limit, 5, 20);
    const items = await News.find({ category: 'beauty' })
      .sort({ publishedAt: -1 })
      .limit(limit);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Paginated news feed
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = sanitizeLimit(req.query.limit, 15, 30);
    const skip = (page - 1) * limit;
    const filter = { category: 'beauty' };
    const [items, total] = await Promise.all([
      News.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      News.countDocuments(filter),
    ]);
    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/trending', newsController.getTrending);

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

router.post('/refresh', protect, adminOnly, async (req, res) => {
  try {
    const { added, rotated } = await fetchBeautyNews();
    res.json({
      message: 'Manual refresh completed ✅',
      added,
      rotated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

