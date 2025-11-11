const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect, adminOnly } = require('../middleWare/authMiddleware');
const controller = require('../controllers/reportsController');

router.post('/', protect, controller.create);
router.get('/pending', protect, adminOnly, controller.listPending);
router.post('/:id/handle', protect, adminOnly, controller.handle);

module.exports = router;
