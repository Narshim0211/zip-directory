const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeChargeId: {
      type: String,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    stripeAccountId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'full_payment', 'refund', 'subscription', 'payout'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    description: {
      type: String,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet'],
      default: 'card',
    },
    receiptUrl: {
      type: String,
    },
    errorMessage: {
      type: String,
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
transactionSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
transactionSchema.index({ customerId: 1, type: 1, createdAt: -1 });
transactionSchema.index({ bookingId: 1, type: 1 });

// Virtual for transaction reference
transactionSchema.virtual('transactionRef').get(function () {
  return `TXN${this._id.toString().slice(-8).toUpperCase()}`;
});

transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);
