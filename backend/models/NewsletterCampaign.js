const mongoose = require('mongoose');

const newsletterCampaignSchema = new mongoose.Schema(
  {
    audience: {
      type: String,
      enum: ['VISITOR', 'OWNER'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    preheader: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    contentHtml: {
      type: String,
      required: true,
    },
    contentText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'],
      default: 'DRAFT',
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stats: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      sentCount: {
        type: Number,
        default: 0,
      },
      failedCount: {
        type: Number,
        default: 0,
      },
    },
    errorLog: {
      type: String,
      default: '',
    },
  },
  { 
    timestamps: true,
  }
);

// Indexes for efficient queries
newsletterCampaignSchema.index({ audience: 1, status: 1, createdAt: -1 });
newsletterCampaignSchema.index({ createdByAdminId: 1, createdAt: -1 });
newsletterCampaignSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('NewsletterCampaign', newsletterCampaignSchema);
