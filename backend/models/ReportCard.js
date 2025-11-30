const mongoose = require("mongoose");

/**
 * ReportCard Model
 *
 * Stores computed/aggregated Report Card data for each user.
 * This is populated by nightly CRON job from WeeklyReport data.
 * One document per user - updated nightly.
 */

const TrendDataSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    feeling: { type: Number, min: 1, max: 5 },
    date: Date
  },
  { _id: false }
);

const HabitScoreSchema = new mongoose.Schema(
  {
    habit: { type: String, required: true },     // e.g., 'deep-conditioning'
    label: { type: String, required: true },     // e.g., 'Deep Conditioning'
    goodWeeks: { type: Number, default: 0 },     // Weeks with feeling >= 4
    totalWeeks: { type: Number, default: 0 },    // Total weeks habit was selected
    score: { type: Number, default: 0 }          // Effectiveness percentage (0-100)
  },
  { _id: false }
);

const ProductScoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avgFeeling: { type: Number, default: 0 },
    timesUsed: { type: Number, default: 0 }
  },
  { _id: false }
);

const WinSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    text: { type: String, required: true },
    photo: String,                               // URL if exists
    date: Date
  },
  { _id: false }
);

const RedFlagSchema = new mongoose.Schema(
  {
    issue: { type: String, required: true },     // e.g., 'heat-styling'
    label: { type: String, required: true },     // e.g., 'Heat Styling'
    badWeeks: { type: Number, default: 0 },      // Weeks with feeling <= 2
    totalWeeks: { type: Number, default: 0 },
    correlation: { type: Number, default: 0 }    // Correlation percentage (0-100)
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    doMore: [String],                            // Top 3 habits to continue
    avoid: String,                               // Top red flag to avoid
    targetGoodWeeks: { type: Number, default: 0 } // Projected good weeks per month
  },
  { _id: false }
);

const ReportCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // Summary statistics
    weeksTracked: { type: Number, default: 0 },
    avgFeeling: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },

    // Section 1: Hair Trend (last 12 weeks)
    trendData: [TrendDataSchema],

    // Section 2: What Actually Works (ranked habits)
    topHabits: [HabitScoreSchema],

    // Section 3: Holy Grail Products
    topProducts: [ProductScoreSchema],

    // Section 4: Biggest Wins
    wins: [WinSchema],

    // Section 5: Red Flags to Avoid
    redFlags: [RedFlagSchema],

    // Section 6: Personal Prescription
    prescription: PrescriptionSchema,

    // Metadata
    journeyStartDate: Date,
    lastComputedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for efficient lookups
ReportCardSchema.index({ lastComputedAt: 1 });

module.exports = mongoose.model("ReportCard", ReportCardSchema);
