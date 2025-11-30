const mongoose = require("mongoose");

/**
 * ReportCardArchive Model
 *
 * Stores frozen snapshots of Report Cards when users "Start Fresh".
 * Each archive represents a completed hair journey chapter.
 * Users can view these within the app (no downloadable PDF).
 */

const ReportCardArchiveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Chapter identification
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "My Hair Journey"
    },

    // Journey period
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Frozen snapshot of ReportCard at archive time
    snapshot: {
      weeksTracked: Number,
      avgFeeling: Number,
      currentStreak: Number,

      // All 6 sections frozen
      trendData: [{
        week: Number,
        feeling: Number,
        date: Date
      }],

      topHabits: [{
        habit: String,
        label: String,
        goodWeeks: Number,
        totalWeeks: Number,
        score: Number
      }],

      topProducts: [{
        name: String,
        avgFeeling: Number,
        timesUsed: Number
      }],

      wins: [{
        week: Number,
        text: String,
        photo: String,
        date: Date
      }],

      redFlags: [{
        issue: String,
        label: String,
        badWeeks: Number,
        totalWeeks: Number,
        correlation: Number
      }],

      prescription: {
        doMore: [String],
        avoid: String,
        targetGoodWeeks: Number
      }
    },

    // Cover photos for visual preview
    coverPhotos: {
      first: String,   // URL of earliest photo
      last: String     // URL of latest photo
    },

    // Goal at time of archive
    goal: String
  },
  { timestamps: true }
);

// Index for efficient listing
ReportCardArchiveSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ReportCardArchive", ReportCardArchiveSchema);
