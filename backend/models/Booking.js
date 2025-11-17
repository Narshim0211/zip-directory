const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business is required'],
  },
  
  // Service details
  service: {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Service is required'],
    },
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },

  // Staff member (optional - may be auto-assigned)
  staff: {
    staffId: mongoose.Schema.Types.ObjectId,
    name: String,
  },

  // Appointment time
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true,
  },

  // Customer details
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },

  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
  },

  // Payment status
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'deposit-paid', 'paid'],
    default: 'unpaid',
  },

  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,

  // Confirmation
  confirmedAt: Date,

  // Reminder sent tracking
  reminderSent: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
});

// Index for querying bookings by business and date
bookingSchema.index({ business: 1, appointmentDate: 1, startTime: 1 });

// Index for checking staff availability
bookingSchema.index({ 'staff.staffId': 1, appointmentDate: 1, status: 1 });

// Virtual for full customer identifier
bookingSchema.virtual('customerIdentifier').get(function() {
  return `${this.customer.name} (${this.customer.email})`;
});

module.exports = mongoose.model('Booking', bookingSchema);
