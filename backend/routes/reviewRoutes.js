const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Business = require("../models/Business");

// Recent reviews feed (public) – declare before param routes
router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(parseInt((req.query && req.query.limit) || "20", 10) || 20, 50);
    const reviews = await Review.find({ status: "visible" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("business", "name city category")
      .populate("user", "name");
    const mapped = reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.text,
      createdAt: r.createdAt,
      business: r.business,
      user: r.user,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reviews by user id (public for now)
router.get("/by-user/:userId", async (req, res) => {
  try {
    const list = await Review.find({ user: req.params.userId, status: "visible" })
      .sort({ createdAt: -1 })
      .populate("business", "name city category");
    const items = list.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.text,
      createdAt: r.createdAt,
      business: r.business,
    }));
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all reviews for a specific business
router.get("/:businessId", async (req, res) => {
  try {
    const reviews = await Review.find({ business: req.params.businessId, status: "visible" })
      .sort({ createdAt: -1 })
      .populate("user", "name");
    const mapped = reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.text,
      createdAt: r.createdAt,
      user: r.user,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new review for a business
router.post("/:businessId", async (req, res) => {
  try {
    const { rating, comment, text, user } = req.body || {};
    const bodyText = (typeof text === "string" ? text : (typeof comment === "string" ? comment : ""));

    const newReview = new Review({
      business: req.params.businessId,
      user,
      rating,
      text: bodyText,
    });
const savedReview = await newReview.save();

    const reviews = await Review.find({ business: req.params.businessId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
await Business.findByIdAndUpdate(req.params.businessId, {
  ratingAverage: avg,
  ratingsCount: reviews.length,
});

    res.status(201).json({
      _id: savedReview._id,
      rating: savedReview.rating,
      comment: savedReview.text,
      createdAt: savedReview.createdAt,
    });
    // Best-effort: add to activity feed if model is present
    try {
      const Activity = require('../models/Activity');
      await Activity.create({
        type: 'review',
        title: 'New review posted',
        description: `A ${savedReview.rating}-star review was posted`,
        link: `/business/${req.params.businessId}`,
      });
    } catch (_) {}
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
