const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    contentId: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      enum: ["survey", "post", "comment"], // Extended to support comments
      required: true
    },
    reactionType: {
      type: String,
      enum: ["like", "love"],
      required: true
    }
  },
  { timestamps: true }
);

// CRITICAL: Compound unique index - prevents duplicate reactions
// One user can have ONLY ONE reaction per content item
reactionSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

// Static method to toggle reaction (add/remove/switch)
reactionSchema.statics.toggleReaction = async function(userId, contentId, contentType, reactionType) {
  // Find existing reaction by this user on this content
  const existingReaction = await this.findOne({ userId, contentId, contentType });

  if (existingReaction) {
    // User already has a reaction
    if (existingReaction.reactionType === reactionType) {
      // Same reaction type - REMOVE it (toggle off)
      await this.deleteOne({ _id: existingReaction._id });
      return {
        action: 'removed',
        oldReaction: reactionType,
        newReaction: null
      };
    } else {
      // Different reaction type - SWITCH it
      const oldReaction = existingReaction.reactionType;
      existingReaction.reactionType = reactionType;
      await existingReaction.save();
      return {
        action: 'switched',
        oldReaction: oldReaction,
        newReaction: reactionType
      };
    }
  } else {
    // No existing reaction - ADD new one
    await this.create({ userId, contentId, contentType, reactionType });
    return {
      action: 'added',
      oldReaction: null,
      newReaction: reactionType
    };
  }
};

// Static method to get user's current reaction on content
reactionSchema.statics.getUserReaction = async function(userId, contentId, contentType) {
  if (!userId) return null;

  const reaction = await this.findOne({ userId, contentId, contentType });
  return reaction ? reaction.reactionType : null;
};

// Static method to get reaction counts for content
reactionSchema.statics.getReactionCounts = async function(contentId, contentType) {
  const reactions = await this.aggregate([
    { $match: { contentId, contentType } },
    { $group: { _id: '$reactionType', count: { $sum: 1 } } }
  ]);

  const counts = {
    like: 0,
    love: 0,
    total: 0
  };

  reactions.forEach(r => {
    counts[r._id] = r.count;
    counts.total += r.count;
  });

  return counts;
};

module.exports = mongoose.model("Reaction", reactionSchema);
