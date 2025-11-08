const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      minlength: 20,
    },
    images: [String],
    status: {
      type: String,
      enum: ["visible", "hidden", "reported"],
      default: "visible",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from the same user for one business
reviewSchema.index({ business: 1, user: 1 }, { unique: true });

// 🔁 Auto update business ratingAverage when new review is saved
reviewSchema.post("save", async function (doc, next) {
  const Business = mongoose.model("Business");
  const reviews = await mongoose.model("Review").find({ business: doc.business, status: "visible" });

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / reviews.length;

  await Business.findByIdAndUpdate(doc.business, {
    ratingAverage: avg,
    ratingsCount: reviews.length,
  });

  next();
});

module.exports = mongoose.model("Review", reviewSchema);
