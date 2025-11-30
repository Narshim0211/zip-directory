const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const surveyController = require('../controllers/surveyController');

// Trending endpoints (public, no auth required)
router.get('/trending/week', surveyController.getTrendingWeek);
router.get('/trending/today', surveyController.getTrendingToday);
router.get('/trending/survey-of-the-day', surveyController.getSurveyOfTheDay);

// Standard endpoints
router.post('/', protect, surveyController.createSurvey);
router.get('/feed', surveyController.getFeed);
router.post('/:id/vote', protect, surveyController.vote);
router.delete('/:id', protect, surveyController.deleteSurvey);
router.get('/mine', protect, surveyController.getMine);

module.exports = router;
