const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const { protect, adminOnly } = require("../middleWare/authMiddleware");

// âœ… 1ï¸âƒ£ GET all approved businesses (public)
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find({ status: "approved" });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recent approved businesses (optional city filter)
router.get("/recent", async (req, res) => {
  try {
    const { city, limit } = req.query;
    const filter = { status: "approved" };
    if (city && String(city).trim()) filter.city = city;
    const items = await Business.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit || "10", 10) || 10, 50));
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trending approved businesses (ratingsCount & ratingAverage as proxy)
router.get("/trending", async (req, res) => {
  try {
    const { city, limit } = req.query;
    const filter = { status: "approved" };
    if (city && String(city).trim()) filter.city = city;
    const items = await Business.find(filter)
      .sort({ ratingsCount: -1, ratingAverage: -1, createdAt: -1 })
      .limit(Math.min(parseInt(limit || "10", 10) || 10, 50));
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single business by id (public)
router.get("/:id", async (req, res) => {
  try {
    const biz = await Business.findById(req.params.id);
    if (!biz) return res.status(404).json({ message: "Business not found" });
    res.json(biz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// âœ… 2ï¸âƒ£ POST a new business (auth required; owner from token; status defaults to 'pending')
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

// âœ… 3ï¸âƒ£ PATCH business status (admin only: approve/reject/pending)
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

// âœ… 4ï¸âƒ£ PUT (shortcut) - Approve business directly (admin only)
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

// âœ… 5ï¸âƒ£ DELETE business (owner or admin only)
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


// Search approved businesses
router.get('/search', async (req, res) => {
  try {
    const { query = "", city = "", category = "", minRating = "", sort = "" } = req.query || {};
    const filter = { status: 'approved' };
    if (city && String(city).trim()) filter.city = city;
    if (category && String(category).trim()) filter.category = category;
    if (minRating) filter.ratingAverage = { $gte: Number(minRating) || 0 };

    let q = Business.find(filter);
    if (query && String(query).trim()) {
      // Escape regex meta-characters correctly (replacement uses $& for the matched char)
      const escaped = String(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      q = Business.find({ ...filter, $or: [{ name: regex }, { city: regex }] });
    }

    const sortMap = {
      rating: { ratingAverage: -1, ratingsCount: -1 },
      reviews: { ratingsCount: -1, ratingAverage: -1 },
      newest: { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const items = await q.sort(sortObj).limit(100);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
module.exports = router;

