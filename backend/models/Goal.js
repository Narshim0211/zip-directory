const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["length", "color", "style", "beard", "skin", "nails", "other"],
      default: "other",
    },
    targetDate: Date,
    notes: { type: String, default: "" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Goal", goalSchema);

