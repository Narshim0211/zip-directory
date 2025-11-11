const createRouter = require('./asyncRouter');
const router = createRouter();
const feedController = require('../controllers/feedController');
const { protect } = require('../middleWare/authMiddleware');

router.get('/visitor', protect, feedController.getVisitorFeed);

module.exports = router;
