const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const analyticsService = require('../services/analyticsService');

router.get('/overview', protect, async (req, res) => {
  try {
    const data = await analyticsService.getOverview(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/engagement', protect, async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const data = await analyticsService.getEngagementTrend(req.user._id, days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/posts', protect, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const data = await analyticsService.getPostMetrics(req.user._id, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/followers', protect, async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const data = await analyticsService.getFollowersTrend(req.user._id, days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/geo', protect, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const data = await analyticsService.getGeoBreakdown(req.user._id, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
