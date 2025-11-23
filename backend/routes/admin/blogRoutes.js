const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  togglePublish
} = require('../../controllers/admin/adminBlogController');
const { protect, adminOnly } = require('../../middleWare/authMiddleWare');

// All routes require Admin authentication
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/admin/blog
 * @desc    Get all blogs (including unpublished)
 * @access  Private (Super Admin)
 *
 * @route   POST /api/admin/blog
 * @desc    Create new blog
 * @access  Private (Super Admin)
 */
router.route('/')
  .get(getAllBlogs)
  .post(createBlog);

/**
 * @route   GET /api/admin/blog/:id
 * @desc    Get single blog by ID
 * @access  Private (Super Admin)
 *
 * @route   PUT /api/admin/blog/:id
 * @desc    Update blog
 * @access  Private (Super Admin)
 *
 * @route   DELETE /api/admin/blog/:id
 * @desc    Delete blog
 * @access  Private (Super Admin)
 */
router.route('/:id')
  .get(getBlogById)
  .put(updateBlog)
  .delete(deleteBlog);

/**
 * @route   PATCH /api/admin/blog/:id/publish
 * @desc    Toggle blog publish status
 * @access  Private (Super Admin)
 */
router.patch('/:id/publish', togglePublish);

module.exports = router;
