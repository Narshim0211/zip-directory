const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['owner', 'staff'],
      default: 'staff',
    },
    specialties: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    avatarUrl: {
      type: String,
    },
    workingHours: {
      monday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' }, // HH:mm format
        end: { type: String, default: '17:00' },
      },
      tuesday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
      },
      wednesday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
      },
      thursday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
      },
      friday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
      },
      saturday: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '10:00' },
        end: { type: String, default: '15:00' },
      },
      sunday: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '10:00' },
        end: { type: String, default: '15:00' },
      },
    },
    timezone: {
      type: String,
      default: 'America/New_York',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
staffSchema.index({ ownerId: 1, isActive: 1 });
staffSchema.index({ businessId: 1, isActive: 1 });
staffSchema.index({ email: 1 });

// Virtual for full name
staffSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

staffSchema.set('toJSON', { virtuals: true });
staffSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Staff', staffSchema);
