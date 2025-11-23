const asyncHandler = require('../../middleWare/asyncHandler');
const Blog = require('../../models/Blog');

/**
 * @route   POST /api/admin/blog
 * @desc    Create new blog (Super Admin only)
 * @access  Private (Super Admin)
 */
exports.createBlog = asyncHandler(async (req, res) => {
  const { title, coverImage, content, excerpt, category } = req.body;

  // Validation
  if (!title || !coverImage || !content || !category) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, cover image, content, and category'
    });
  }

  // Validate category
  const validCategories = ['hair', 'nails', 'skin', 'makeup', 'business', 'trends'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${validCategories.join(', ')}`
    });
  }

  // Create blog (slug auto-generated in pre-save hook)
  const blog = await Blog.create({
    title,
    coverImage,
    content,
    excerpt,
    category,
    published: true
  });

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    blog
  });
});

/**
 * @route   GET /api/admin/blog
 * @desc    Get all blogs (including unpublished) for admin
 * @access  Private (Super Admin)
 */
exports.getAllBlogs = asyncHandler(async (req, res) => {
  const { limit, category, published } = req.query;

  // Build query
  const query = {};
  if (category && category !== 'all') {
    query.category = category;
  }
  if (published !== undefined) {
    query.published = published === 'true';
  }

  // Fetch all blogs (admin can see unpublished)
  let blogsQuery = Blog.find(query).sort({ createdAt: -1 });

  if (limit) {
    blogsQuery = blogsQuery.limit(parseInt(limit));
  }

  const blogs = await blogsQuery;

  res.json({
    success: true,
    count: blogs.length,
    blogs
  });
});

/**
 * @route   GET /api/admin/blog/:id
 * @desc    Get single blog by ID for editing
 * @access  Private (Super Admin)
 */
exports.getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  res.json({
    success: true,
    blog
  });
});

/**
 * @route   PUT /api/admin/blog/:id
 * @desc    Update blog
 * @access  Private (Super Admin)
 */
exports.updateBlog = asyncHandler(async (req, res) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Update blog
  blog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Blog updated successfully',
    blog
  });
});

/**
 * @route   DELETE /api/admin/blog/:id
 * @desc    Delete blog
 * @access  Private (Super Admin)
 */
exports.deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  await blog.deleteOne();

  res.json({
    success: true,
    message: 'Blog deleted successfully'
  });
});

/**
 * @route   PATCH /api/admin/blog/:id/publish
 * @desc    Toggle blog publish status
 * @access  Private (Super Admin)
 */
exports.togglePublish = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  blog.published = !blog.published;

  // Set publishedAt when first published
  if (blog.published && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }

  await blog.save();

  res.json({
    success: true,
    message: `Blog ${blog.published ? 'published' : 'unpublished'} successfully`,
    blog
  });
});
