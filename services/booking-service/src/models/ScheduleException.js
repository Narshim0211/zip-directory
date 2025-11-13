const mongoose = require('mongoose');

const scheduleExceptionSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['day_off', 'custom_hours', 'blocked'],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    customHours: {
      start: { type: String }, // HH:mm format
      end: { type: String },
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
      },
      interval: {
        type: Number,
        min: 1,
      },
      endDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
scheduleExceptionSchema.index({ staffId: 1, date: 1 }, { unique: true });
scheduleExceptionSchema.index({ ownerId: 1, date: 1 });

module.exports = mongoose.model('ScheduleException', scheduleExceptionSchema);
