const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    serviceName: {
      type: String,
      required: true,
    },
    servicePrice: {
      type: Number,
      required: true,
    },
    staffName: {
      type: String,
      required: true,
    },
    depositRequired: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    depositTransactionId: {
      type: String,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'deposit_paid', 'fully_paid', 'refunded'],
      default: 'unpaid',
    },
    notes: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'owner', 'staff', 'system'],
    },
    cancelledAt: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
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

// Compound indexes for overlap prevention
bookingSchema.index({ staffId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ ownerId: 1, startTime: 1 });
bookingSchema.index({ customerId: 1, startTime: -1 });
bookingSchema.index({ status: 1, startTime: 1 });

// Virtual for booking reference
bookingSchema.virtual('bookingRef').get(function () {
  return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canCancel = function () {
  const now = new Date();
  const timeUntilBooking = this.startTime - now;
  const minCancellationTime = 24 * 60 * 60 * 1000; // 24 hours
  
  return (
    ['pending', 'confirmed'].includes(this.status) &&
    timeUntilBooking > minCancellationTime
  );
};

// Method to check if booking can be rescheduled
bookingSchema.methods.canReschedule = function () {
  const now = new Date();
  const timeUntilBooking = this.startTime - now;
  const minRescheduleTime = 24 * 60 * 60 * 1000; // 24 hours
  
  return (
    ['pending', 'confirmed'].includes(this.status) &&
    timeUntilBooking > minRescheduleTime
  );
};

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
