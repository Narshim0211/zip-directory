const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const controller = require('../controllers/followController');

router.post('/follow/:id', protect, controller.followUser);
router.delete('/unfollow/:id', protect, controller.unfollowUser);
router.get('/followers/:id', controller.listFollowers);
router.get('/following', protect, controller.listFollowing);
router.get('/following/:id', protect, controller.listFollowing);

module.exports = router;
