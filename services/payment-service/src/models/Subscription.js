const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'premium'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'cancelled', 'trialing'],
      default: 'inactive',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    interval: {
      type: String,
      enum: ['month', 'year'],
      default: 'month',
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    nextPaymentDate: {
      type: Date,
    },
    failedPaymentCount: {
      type: Number,
      default: 0,
    },
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
subscriptionSchema.index({ ownerId: 1, status: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });

// Check if subscription is active
subscriptionSchema.methods.isActive = function () {
  return this.status === 'active' || this.status === 'trialing';
};

// Check if subscription is past due
subscriptionSchema.methods.isPastDue = function () {
  return this.status === 'past_due';
};

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
