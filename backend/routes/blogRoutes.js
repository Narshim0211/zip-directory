const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getRelatedBlogs
} = require('../controllers/blogController');

/**
 * @route   GET /api/blog
 * @desc    Get published blogs
 * @access  Public
 */
router.get('/', getBlogs);

/**
 * @route   GET /api/blog/:slug
 * @desc    Get single blog by slug
 * @access  Public
 */
router.get('/:slug', getBlogBySlug);

/**
 * @route   GET /api/blog/:slug/related
 * @desc    Get related blogs
 * @access  Public
 */
router.get('/:slug/related', getRelatedBlogs);

module.exports = router;
