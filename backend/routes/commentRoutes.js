const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect, adminOnly } = require('../middleWare/authMiddleware');
const { moderateText } = require('../middleWare/commentModeration');
const controller = require('../controllers/commentsController');

router.get('/', controller.getComments);
router.post('/', protect, moderateText, controller.create);
router.post('/:id/reply', protect, moderateText, controller.reply);
router.put('/:id', protect, moderateText, controller.edit);
router.delete('/:id', protect, controller.softDelete);
router.post('/:id/like', protect, controller.toggleLike);
router.post('/:id/react', protect, controller.react);
router.post('/:id/pin', protect, adminOnly, controller.pin);
router.get('/user/my', protect, controller.userComments);

module.exports = router;
