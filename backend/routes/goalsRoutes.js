const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const goals = require('../controllers/goalsController');

router.use(protect);

router.get('/my', goals.listMine);
router.post('/', goals.create);
router.put('/:id', goals.update);
router.delete('/:id', goals.remove);

module.exports = router;

