const { Schema, model } = require('mongoose');

const beautyProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, unique: true },
    hairType: { type: String },
    hairLength: { type: String },
    skinTone: { type: String },
    styleGoal: { type: String },
    budget: { type: String },
    maintenance: { type: String },
  },
  { timestamps: true }
);

module.exports = model('BeautyProfile', beautyProfileSchema);
