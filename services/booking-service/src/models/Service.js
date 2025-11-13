const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['haircut', 'coloring', 'styling', 'treatment', 'nails', 'spa', 'other'],
      default: 'other',
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 5,
      max: 480, // max 8 hours
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    depositRequired: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    depositPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 25,
    },
    staffIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
    tags: [String],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceSchema.index({ ownerId: 1, isActive: 1 });
serviceSchema.index({ businessId: 1, category: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for computed deposit
serviceSchema.virtual('computedDeposit').get(function () {
  if (!this.depositRequired) return 0;
  return this.depositAmount > 0
    ? this.depositAmount
    : (this.price * this.depositPercentage) / 100;
});

serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);
