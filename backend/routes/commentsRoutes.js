const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const controller = require('../controllers/commentsController');

router.get('/:id', controller.list);
router.post('/:id', protect, controller.create);

module.exports = router;
