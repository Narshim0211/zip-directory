const createRouter = require('./asyncRouter');
const router = createRouter();
const protectOwner = require('../middleWare/authOwnerMiddleware');
const requireProfileComplete = require('../middleWare/requireProfileComplete');
const ownerDashboardController = require('../controllers/owner/ownerDashboardController');
const ownerBusinessController = require('../controllers/owner/ownerBusinessController');
const ownerSurveyController = require('../controllers/owner/ownerSurveyController');
const ownerNotificationController = require('../controllers/owner/ownerNotificationController');
const ownerPostController = require('../controllers/owner/ownerPostController');
const ownerFeedController = require('../controllers/owner/ownerFeedController');
const ownerGalleryController = require('../controllers/owner/ownerGalleryController');

router.get('/dashboard', protectOwner, requireProfileComplete('owner'), ownerDashboardController.getStats);

router.get('/business', protectOwner, ownerBusinessController.getBusiness);
router.put('/business', protectOwner, ownerBusinessController.upsertBusiness);
router.post('/business/gallery', protectOwner, ownerGalleryController.uploadGalleryMedia);
router.delete('/business/gallery', protectOwner, ownerGalleryController.removeGalleryMedia);

router.get('/surveys', protectOwner, requireProfileComplete('owner'), ownerSurveyController.listSurveys);
router.post('/surveys', protectOwner, requireProfileComplete('owner'), ownerSurveyController.createSurvey);

router.get('/posts', protectOwner, requireProfileComplete('owner'), ownerPostController.listPosts);
router.post('/posts', protectOwner, requireProfileComplete('owner'), ownerPostController.createPost);
router.put('/posts/:postId', protectOwner, requireProfileComplete('owner'), ownerPostController.updatePost);
router.delete('/posts/:postId', protectOwner, requireProfileComplete('owner'), ownerPostController.deletePost);
router.post('/posts/:postId/react', protectOwner, requireProfileComplete('owner'), ownerPostController.reactToPost);

router.get('/notifications', protectOwner, ownerNotificationController.listNotifications);
router.post('/notifications/:id/read', protectOwner, ownerNotificationController.markRead);
router.post('/notifications/read-all', protectOwner, ownerNotificationController.markAll);
router.get('/feed', protectOwner, ownerFeedController.getOwnerFeed);
router.get('/feed/insights', protectOwner, ownerFeedController.getOwnerInsights);

module.exports = router;
