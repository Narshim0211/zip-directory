const multer = require('multer');
const path = require('path');

// File filter - Only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|wmv|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  const isImage = allowedImageTypes.test(extname.slice(1)) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname.slice(1)) && mimetype.startsWith('video/');
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// Multer configuration - Memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
