const asyncHandler = require('../middleWare/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * @route   POST /api/upload/blog-image
 * @desc    Upload blog cover image
 * @access  Private (Admin only)
 */
exports.uploadBlogImage = [
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Generate public URL for the uploaded image
    const imageUrl = `/uploads/blogs/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  })
];

/**
 * @route   DELETE /api/upload/blog-image/:filename
 * @desc    Delete blog cover image
 * @access  Private (Admin only)
 */
exports.deleteBlogImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  const filePath = path.join(uploadDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Delete file
  fs.unlinkSync(filePath);

  res.json({
    success: true,
    message: 'Image deleted successfully'
  });
});
