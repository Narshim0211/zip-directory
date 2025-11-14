const { Schema, model } = require('mongoose');

const usageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    month: { type: String, required: true },
    visualCount: { type: Number, default: 0 },
    qaCount: { type: Number, default: 0 },
    dailyKey: { type: String, default: '' },
    dailyVisualCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

usageSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = model('StyleUsageCounter', usageSchema);
