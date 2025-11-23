const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    message: {
      type: String,
      required: [true, 'Review message is required'],
      trim: true,
      minlength: [10, 'Review message must be at least 10 characters'],
      maxlength: [500, 'Review message cannot exceed 500 characters'],
    },
    photoUrl: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    moderatedReason: {
      type: String,
      default: null,
      trim: true,
    },

    // 🚨 AUTO-FLAGGING FIELDS (Phase 2: Reporting System)
    // Used when community reports trigger auto-hide
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: {
      type: String,
      default: '',
    },
    flaggedAt: {
      type: Date,
      default: null,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // Author reference for reporting system
    // (userId is the reviewer, but we use 'author' for consistency with Post model)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: function() { return this.userId; } // Auto-populate from userId
    },
  },
  {
    timestamps: true, // Auto-create createdAt and updatedAt fields
  }
);

// ✅ FIX #1: Prevent review spam exploit
// Each booking can only have ONE review (prevents same user leaving 20 five-star reviews from one booking)
reviewSchema.index({ bookingId: 1 }, { unique: true });

// 📊 Composite index for efficient queries (business reviews list with filtering)
// This index optimizes the most common query: "Get all approved reviews for a business, sorted by date"
reviewSchema.index({ businessId: 1, status: 1, createdAt: -1 });

// 🔍 User reviews index (for "my reviews" page in future)
reviewSchema.index({ userId: 1, createdAt: -1 });

/**
 * 📄 JSON Representation for API Responses
 * Returns review data with populated user information
 */
reviewSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    rating: this.rating,
    message: this.message,
    photoUrl: this.photoUrl,
    createdAt: this.createdAt,
    user: {
      name: this.userId?.name || 'Anonymous',
      avatarUrl: this.userId?.avatarUrl || null,
    },
  };
};

module.exports = mongoose.model('Review', reviewSchema);
