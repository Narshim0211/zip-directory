const createRouter = require("./asyncRouter");
const { protect } = require("../middleWare/authMiddleware");
const weeklyReportController = require("../controllers/weeklyReportController");

const router = createRouter();

router.use(protect);

router.get("/", weeklyReportController.list);
router.get("/:id", weeklyReportController.getById);
router.post("/", weeklyReportController.upsert);

module.exports = router;
