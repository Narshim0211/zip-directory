const express = require('express');
const router = express.Router();
const { uploadBlogImage, deleteBlogImage } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleWare/authMiddleWare');

/**
 * @route   POST /api/upload/blog-image
 * @desc    Upload blog cover image
 * @access  Private (Admin only)
 */
router.post('/blog-image', protect, adminOnly, uploadBlogImage);

/**
 * @route   DELETE /api/upload/blog-image/:filename
 * @desc    Delete blog cover image
 * @access  Private (Admin only)
 */
router.delete('/blog-image/:filename', protect, adminOnly, deleteBlogImage);

module.exports = router;
