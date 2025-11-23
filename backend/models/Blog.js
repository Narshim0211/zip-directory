const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a blog title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  coverImage: {
    type: String,
    required: [true, 'Please add a cover image']
  },
  content: {
    type: String,
    required: [true, 'Please add blog content']
  },
  excerpt: {
    type: String,
    maxlength: [200, 'Excerpt cannot be more than 200 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['hair', 'nails', 'skin', 'makeup', 'business', 'trends'],
      message: 'Category must be one of: hair, nails, skin, makeup, business, trends'
    },
    required: [true, 'Please select a category']
  },
  published: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-generate slug from title before saving
BlogSchema.pre('save', async function(next) {
  // Only generate slug if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    // Convert title to slug: lowercase, replace special chars with dashes
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, '');      // Remove leading/trailing dashes

    // Ensure slug uniqueness by appending -2, -3, etc. if needed
    let uniqueSlug = baseSlug;
    let counter = 2;

    while (await mongoose.models.Blog.findOne({
      slug: uniqueSlug,
      _id: { $ne: this._id }
    })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }

  // Auto-generate excerpt if missing (strip HTML, take first 200 chars)
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    this.excerpt = plainText.substring(0, 200).trim();

    // Add ellipsis if truncated
    if (plainText.length > 200) {
      this.excerpt += '...';
    }
  }

  // Set publishedAt timestamp on first publish
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Add index for faster queries
BlogSchema.index({ slug: 1 });
BlogSchema.index({ category: 1, publishedAt: -1 });
BlogSchema.index({ published: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', BlogSchema);
