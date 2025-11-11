const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const aiController = require('../controllers/aiController');

router.post('/advice', protect, aiController.advice);

module.exports = router;
