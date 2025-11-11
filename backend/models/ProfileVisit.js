const mongoose = require('mongoose');

const profileVisitSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

profileVisitSchema.index({ businessId: 1, visitedAt: -1 });
profileVisitSchema.index({ visitorId: 1 });

module.exports = mongoose.model('ProfileVisit', profileVisitSchema);
