const mongoose = require('mongoose');

/**
 * ImpressionCount Model
 * Aggregated counter pattern - stores ONE document per content item
 * NOT individual impression events (scalable for millions of impressions)
 *
 * Design: Similar to Instagram/TikTok/X (Twitter) impression tracking
 */
const impressionCountSchema = new mongoose.Schema({
  contentId: {
    type: String,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['post', 'survey'],
    required: true
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// CRITICAL: Compound unique index - one counter per content item
impressionCountSchema.index({ contentId: 1, contentType: 1 }, { unique: true });

// Static method to increment impression count
impressionCountSchema.statics.addImpression = async function(contentId, contentType) {
  const result = await this.findOneAndUpdate(
    { contentId, contentType },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  return result;
};

// Static method to get impression count
impressionCountSchema.statics.getCount = async function(contentId, contentType) {
  const result = await this.findOne({ contentId, contentType });
  return result ? result.count : 0;
};

// Static method to get multiple impression counts (batch query)
impressionCountSchema.statics.getCountsBatch = async function(contentIds, contentType) {
  const results = await this.find({
    contentId: { $in: contentIds },
    contentType
  });

  // Map to object for easy lookup
  const countsMap = {};
  results.forEach(r => {
    countsMap[r.contentId] = r.count;
  });

  // Fill in zeros for missing entries
  contentIds.forEach(id => {
    if (!countsMap[id]) {
      countsMap[id] = 0;
    }
  });

  return countsMap;
};

module.exports = mongoose.model('ImpressionCount', impressionCountSchema);
