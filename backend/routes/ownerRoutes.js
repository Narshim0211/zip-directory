const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const Business = require('../models/Business');
const Review = require('../models/Review');

// Minimal owner stats: totals derived from businesses owned by the user
router.get('/stats', protect, async (req, res) => {
  try {
    const ownerId = String(req.user._id);
    const bizList = await Business.find({ owner: ownerId });
    const bizIds = bizList.map(b => b._id);

    const [reviewsAgg] = await Review.aggregate([
      { $match: { business: { $in: bizIds } } },
      { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } }
    ]);

    const stats = {
      businesses: bizList.length,
      reviewsCount: reviewsAgg ? reviewsAgg.count : 0,
      avgRating: reviewsAgg ? Number(reviewsAgg.avg || 0) : 0,
      // Placeholder fields for future visits tracking
      weeklyViews: 0,
      monthlyViews: 0,
    };
    res.json(stats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

