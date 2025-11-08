const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const User = require("../models/User");
const Review = require("../models/Review");
const { protect, adminOnly } = require("../middleWare/authMiddleware");

// High-level overview metrics for the dashboard
// Returns users, businesses and reviews counts plus business status breakdown
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalBusinesses, pending, approved, rejected, totalReviews] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      Business.countDocuments({ status: "pending" }),
      Business.countDocuments({ status: "approved" }),
      Business.countDocuments({ status: "rejected" }),
      Review.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalBusinesses,
      pending,
      approved,
      rejected,
      totalReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all businesses (for dashboard)
router.get("/businesses", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;

    // Optional filter by status: ?status=pending
    const filter = status ? { status } : {};
    const businesses = await Business.find(filter).populate("owner", "name email role");

    res.json({
      total: businesses.length,
      filter: status || "all",
      businesses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Approve a business
router.put("/businesses/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Business not found" });
    res.json({ message: "Business approved", business: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Reject a business
router.put("/businesses/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Business not found" });
    res.json({ message: "Business rejected", business: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Basic admin analytics
// (Existing endpoints remain below)

// Users – list with filters and paging
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const q = (req.query.q || '').trim();
    const role = (req.query.role || '').trim();

    const filter = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (role) filter.role = role;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body || {};
    const allowed = ['visitor', 'owner', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ user: updated, updated: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user (prevent self-delete)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'Cannot delete the signed-in admin' });
    }
    const removed = await User.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'User not found' });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
