const asyncHandler = require('../middleWare/asyncHandler');
const Blog = require('../models/Blog');

/**
 * @route   GET /api/blog
 * @desc    Get published blogs with optional filtering
 * @access  Public
 */
exports.getBlogs = asyncHandler(async (req, res) => {
  const { limit = 6, category, skip = 0 } = req.query;

  // Build query for published blogs only
  const query = { published: true };

  // Filter by category if provided (and not 'all')
  if (category && category !== 'all') {
    query.category = category;
  }

  // Fetch blogs with pagination
  const blogs = await Blog.find(query)
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .select('-__v');

  // Get total count for pagination
  const total = await Blog.countDocuments(query);

  res.json({
    success: true,
    count: blogs.length,
    total,
    blogs
  });
});

/**
 * @route   GET /api/blog/:slug
 * @desc    Get single blog by slug
 * @access  Public
 */
exports.getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    published: true
  }).select('-__v');

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Increment view count
  blog.views = (blog.views || 0) + 1;
  await blog.save();

  res.json({
    success: true,
    blog
  });
});

/**
 * @route   GET /api/blog/:slug/related
 * @desc    Get related blogs (same category, excluding current)
 * @access  Public
 */
exports.getRelatedBlogs = asyncHandler(async (req, res) => {
  const { limit = 3 } = req.query;

  // Find the current blog
  const currentBlog = await Blog.findOne({
    slug: req.params.slug,
    published: true
  });

  if (!currentBlog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Find related blogs (same category, excluding current)
  const relatedBlogs = await Blog.find({
    category: currentBlog.category,
    published: true,
    _id: { $ne: currentBlog._id }
  })
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

  res.json({
    success: true,
    count: relatedBlogs.length,
    blogs: relatedBlogs
  });
});
