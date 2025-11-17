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
  },
  { timestamps: true }
);

WeeklyReportSchema.index({ user: 1, journeyId: 1, week: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("WeeklyReport", WeeklyReportSchema);
