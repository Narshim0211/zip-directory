const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const notificationService = require('../services/notificationService');

const respondWithList = async (req, res) => {
  try {
    const { limit, before } = req.query;
    const data = await notificationService.listNotifications(req.user._id, { limit, before });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

router.get('/', protect, respondWithList);
router.get('/my', protect, respondWithList);

router.post('/mark-read/:id', protect, async (req, res) => {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
});

router.post('/mark-all-read', protect, async (req, res) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/:id/read', protect, async (req, res) => {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
});

router.patch('/read-all', protect, async (req, res) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
