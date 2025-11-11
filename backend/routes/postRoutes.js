const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const postController = require('../controllers/postController');

router.get('/', postController.listPosts);
router.post('/', protect, postController.createPost);
router.post('/:postId/comments', protect, postController.addComment);

module.exports = router;
