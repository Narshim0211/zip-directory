const mongoose = require('mongoose');

/**
 * Timeline Post Model
 * Per PRD Section 6: Database Structure
 * 
 * Handles both posts and surveys on user timeline
 */

const timelinePostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    
    type: {
      type: String,
      enum: ['post', 'survey'],
      required: true,
      index: true,
    },
    
    // Post content
    content: {
      type: String,
      maxlength: 5000,
    },
    
    // Media attachments
    media: [
      {
        type: String, // URL to image/video
        url: String,
        mediaType: {
          type: String,
          enum: ['image', 'video'],
        },
      },
    ],
    
    // Survey-specific fields
    surveyQuestion: {
      type: String,
      maxlength: 500,
    },
    
    surveyOptions: [
      {
        text: String,
        votes: {
          type: Number,
          default: 0,
        },
      },
    ],
    
    // Engagement metrics
    likesCount: {
      type: Number,
      default: 0,
    },
    
    commentsCount: {
      type: Number,
      default: 0,
    },
    
    // Visibility
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for timeline queries
timelinePostSchema.index({ userId: 1, createdAt: -1 });
timelinePostSchema.index({ type: 1, createdAt: -1 });
timelinePostSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('TimelinePost', timelinePostSchema);
