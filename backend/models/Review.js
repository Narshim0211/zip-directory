const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    reviewerId: {
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
      minlength: 5,
    },
    images: [String],
    status: {
      type: String,
      enum: ["visible", "hidden", "reported"],
      default: "visible",
    },
    replies: [replySchema],
    isFlagged: { type: Boolean, default: false },
    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    flagReason: { type: String, default: "" },
    isPendingRemoval: { type: Boolean, default: false },
    removalRequestMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ businessId: 1, reviewerId: 1 }, { unique: true });

reviewSchema.post("save", async function (doc, next) {
  const Business = mongoose.model("Business");
  const reviews = await mongoose.model("Review").find({ businessId: doc.businessId, status: "visible" });

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = reviews.length ? total / reviews.length : 0;

  await Business.findByIdAndUpdate(doc.businessId, {
    ratingAverage: avg,
    ratingsCount: reviews.length,
  });

  next();
});

module.exports = mongoose.model("Review", reviewSchema);
