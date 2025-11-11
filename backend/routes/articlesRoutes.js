const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect, adminOnly } = require('../middleWare/authMiddleware');
const controller = require('../controllers/articlesController');

router.get('/feed', protect, controller.feed);
router.post('/', protect, adminOnly, controller.create);

module.exports = router;
