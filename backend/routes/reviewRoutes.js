const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Business = require("../models/Business");

// ✅ GET all reviews for a specific business
router.get("/:businessId", async (req, res) => {
  try {
    const reviews = await Review.find({ business: req.params.businessId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST a new review for a business
router.post("/:businessId", async (req, res) => {
  try {
    const { rating, comment, user } = req.body;

    // 1️⃣ Save the review
    const newReview = new Review({
      business: req.params.businessId,
      user,
      rating,
      comment,
    });
    const savedReview = await newReview.save();

    // 2️⃣ Recalculate the business average rating
    const reviews = await Review.find({ business: req.params.businessId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Business.findByIdAndUpdate(req.params.businessId, {
      ratingAverage: avg,
      ratingsCount: reviews.length,
    });

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
