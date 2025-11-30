const createRouter = require('./asyncRouter');
const { protect } = require('../middleWare/authMiddleware');
const communityStatsService = require('../services/communityStatsService');

const router = createRouter();

/**
 * GET /api/hair-goals/community-stats
 *
 * Get community insights for a goal + week
 * Returns hybrid data (real if enough users, seeded otherwise)
 *
 * Query params:
 * - goal: Hair goal (e.g., 'grow-longer', 'repair')
 * - week: Week number (1-52)
 * - completion: User's completion percentage (0-100)
 *
 * Response:
 * {
 *   headline: "You're in the top 15% this week!",
 *   subtext: "You completed 85% of your routine...",
 *   percentile: 85,
 *   userCompletion: 85,
 *   averageCompletion: 62,
 *   isAboveAverage: true,
 *   isCrushing: true,
 *   tip: { habit: "Deep condition weekly", percentage: 82 }
 * }
 */
router.get('/', protect, async (req, res) => {
  const { goal, week, completion } = req.query;

  // Validate inputs
  if (!goal) {
    return res.status(400).json({ error: 'Goal is required' });
  }

  const weekNumber = parseInt(week, 10) || 1;
  const userCompletion = parseFloat(completion) || 0;

  if (weekNumber < 1 || weekNumber > 52) {
    return res.status(400).json({ error: 'Week must be between 1 and 52' });
  }

  if (userCompletion < 0 || userCompletion > 100) {
    return res.status(400).json({ error: 'Completion must be between 0 and 100' });
  }

  try {
    // Get insights (hybrid: real or seeded)
    const insights = await communityStatsService.getCommunityInsights(
      goal,
      weekNumber,
      userCompletion
    );

    // Generate user-facing message
    const response = communityStatsService.generateInsightsMessage(insights);

    // Don't expose internal 'source' field to user
    res.json(response);
  } catch (err) {
    console.error('Error getting community stats:', err);
    res.status(500).json({ error: 'Failed to get community insights' });
  }
});

/**
 * POST /api/hair-goals/community-stats
 *
 * Record anonymous stat (called automatically when saving weekly progress)
 * This is separate from the weekly report - only stores anonymous aggregate data
 *
 * Body:
 * {
 *   goal: "grow-longer",
 *   weekNumber: 3,
 *   completionPercent: 75,
 *   totalSteps: 5,
 *   completedSteps: 4,
 *   stepTypes: ["Wash", "Deep Condition"],
 *   hairFeeling: "good"
 * }
 */
router.post('/', protect, async (req, res) => {
  const {
    goal,
    weekNumber,
    completionPercent,
    totalSteps,
    completedSteps,
    stepTypes,
    hairFeeling
  } = req.body;

  // Validate required fields
  if (!goal || !weekNumber || !totalSteps) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await communityStatsService.recordAnonymousStat({
      goal,
      weekNumber,
      completionPercent,
      totalSteps,
      completedSteps,
      stepTypes,
      hairFeeling
    });

    // Don't return the stat - keep it anonymous
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error recording community stat:', err);
    res.status(500).json({ error: 'Failed to record stat' });
  }
});

module.exports = router;
