const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const controller = require('../controllers/stylesController');

router.use(protect);

router.get('/my', controller.listMine);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

module.exports = router;
