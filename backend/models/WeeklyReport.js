const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    label: { type: String, trim: true },
    done: { type: Number, default: 0 },
    target: { type: Number, default: 0 },
  },
  { _id: false }
);

const PhotoSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ["before", "after", "progress", "other"],
      default: "other",
    },
  },
  { _id: false }
);

/**
 * CheckIn Schema - Powers the Report Card feature
 * Q1 (healthRating): 1-5 numeric rating for hair health
 * Q2 (goalProgress): Goal-specific progress indicator
 * Q3 (whatHelped): What habits helped this week (max 2)
 * Q4 (whatHarmed): What set the user back (max 2)
 * Q5 (proudMoment): A proud moment text (max 60 chars)
 */
const CheckInSchema = new mongoose.Schema(
  {
    // Q1: Hair health rating (1-5)
    healthRating: {
      type: Number,
      min: 1,
      max: 5
    },

    // Q2: Goal-specific progress (normalized values)
    goalProgress: {
      type: String,
      enum: ["none", "little", "noticeable"]
    },

    // Q3: What helped this week (max 2 selections)
    whatHelped: [{
      type: String,
      enum: [
        // Length
        "scalp-massage", "oil-treatment", "protective-styling", "low-manipulation",
        // Volume
        "root-lifting", "volumizing-shampoo", "blow-dry-technique", "dry-shampoo", "light-conditioner",
        // Repair
        "deep-conditioning", "protein-treatment", "heat-free", "silk-pillowcase", "bond-repair", "gentle-detangling",
        // Curls
        "wet-styling", "diffusing", "leave-in", "curl-cream", "refresh-spray", "pineapple-sleep",
        // Scalp
        "clarifying", "scalp-oil", "gentle-shampoo", "exfoliating", "less-product",
        // Color
        "color-safe-products", "cold-water-rinse", "less-washing", "uv-protection", "gloss-treatment",
        // Universal
        "moisture-balance", "other"
      ]
    }],

    // Q4: What harmed this week (max 2 selections)
    whatHarmed: [{
      type: String,
      enum: [
        "heat-styling", "harsh-shampoo", "tight-styles", "over-manipulation",
        "skipping-moisture", "skipping-protein", "weather-humidity", "chemical-treatment",
        "none", "other"
      ]
    }],

    // Q5: Proud moment (max 60 chars)
    proudMoment: {
      type: String,
      trim: true,
      maxlength: 60
    }
  },
  { _id: false }
);

const WeeklyReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    journeyId: { type: mongoose.Schema.Types.ObjectId, ref: "HairJourney", index: true, default: null },
    week: { type: Number, required: true },
    dates: {
      start: Date,
      end: Date,
    },
    feeling: { type: String, trim: true },
    emoji: { type: String, trim: true },
    note: { type: String, trim: true },
    steps: [StepSchema],
    highlightProduct: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      uses: { type: Number, default: 0 },
    },
    photos: [PhotoSchema],

    // Goal at time of this report (for Report Card aggregation)
    goal: { type: String, trim: true, index: true },

    // Report Card check-in questions
    checkIn: CheckInSchema,
  },
  { timestamps: true }
);

WeeklyReportSchema.index({ user: 1, journeyId: 1, week: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("WeeklyReport", WeeklyReportSchema);
