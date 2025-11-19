const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['visitor', 'owner'],
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Bug',
      'Feature Request',
      'Account Issue',
      'Booking Issue',
      'Payment Issue',
      'Profile Issue',
      'Other'
    ]
  },
  urgency: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    // Only set default for owner feedback
    default: function() {
      return this.userType === 'owner' ? 'MEDIUM' : undefined;
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_REVIEW', 'RESOLVED'],
    default: 'OPEN',
    index: true
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Internal notes cannot exceed 5000 characters'],
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for fast admin queries
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ userType: 1, status: 1 });
feedbackSchema.index({ status: 1, createdAt: -1 });

// Auto-update resolvedAt when status changes to RESOLVED
feedbackSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'RESOLVED' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
