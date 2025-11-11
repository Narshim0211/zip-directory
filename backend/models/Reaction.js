const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

reactionSchema.index({ targetType: 1, target: 1 });

module.exports = mongoose.model("Reaction", reactionSchema);
