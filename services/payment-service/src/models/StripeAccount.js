const mongoose = require('mongoose');

const stripeAccountSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    stripeAccountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ['express', 'standard', 'custom'],
      default: 'express',
    },
    onboardingStatus: {
      type: String,
      enum: ['incomplete', 'pending', 'complete'],
      default: 'incomplete',
      index: true,
    },
    chargesEnabled: {
      type: Boolean,
      default: false,
    },
    payoutsEnabled: {
      type: Boolean,
      default: false,
    },
    detailsSubmitted: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'US',
    },
    currency: {
      type: String,
      default: 'usd',
    },
    businessName: {
      type: String,
    },
    requirements: {
      currentlyDue: [String],
      eventuallyDue: [String],
      pastDue: [String],
      disabled: Boolean,
      disabledReason: String,
    },
    capabilities: {
      cardPayments: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
      },
      transfers: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
      },
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

// Check if account is fully onboarded
stripeAccountSchema.methods.isFullyOnboarded = function () {
  return (
    this.onboardingStatus === 'complete' &&
    this.chargesEnabled &&
    this.payoutsEnabled &&
    this.detailsSubmitted
  );
};

stripeAccountSchema.set('toJSON', { virtuals: true });
stripeAccountSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StripeAccount', stripeAccountSchema);
