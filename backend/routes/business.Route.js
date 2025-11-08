const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const { protect, adminOnly } = require("../middleWare/authMiddleware");

// ✅ 1️⃣ GET all approved businesses (public)
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find({ status: "approved" });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ 2️⃣ POST a new business (auth required; owner from token; status defaults to 'pending')
router.post("/", protect, async (req, res) => {
  try {
    const { name, city, category, description, address, images, services, specialties } = req.body;

    // --- Validation ---
    const errors = [];
    if (!name || !name.trim()) errors.push("'name' is required");
    if (!city || !city.trim()) errors.push("'city' is required");
    if (!category || !category.trim()) errors.push("'category' is required");

    const allowedCategories = Business.schema.path("category").enumValues;
    if (category && !allowedCategories.includes(category)) {
      errors.push(`'category' must be one of: ${allowedCategories.join(", ")}`);
    }

    if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

    // --- Create new business ---
    const business = new Business({
      name: name.trim(),
      city: city.trim(),
      category,
      description,
      address,
      images,
      services,
      specialties,
      owner: req.user._id,  // from logged-in user
      status: "pending",
    });

    const saved = await business.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: details });
    }
    res.status(400).json({ message: error.message });
  }
});

// ✅ 3️⃣ PATCH business status (admin only: approve/reject/pending)
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const allowed = ["pending", "approved", "rejected"];
    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const updated = await Business.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Business not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ 4️⃣ PUT (shortcut) - Approve business directly (admin only)
router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Business not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ 5️⃣ DELETE business (owner or admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    // Only admin or the business owner can delete
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this business" });
    }

    await business.deleteOne();
    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
