const express = require('express');
const router = express.Router();
const mediaUploadController = require('../../controllers/mediaUploadController');
const protectOwner = require('../../middleWare/authOwnerMiddleware');
const upload = require('../../config/multer');

// All routes require owner authentication
router.use(protectOwner);

// Upload single file
router.post('/upload', upload.single('file'), mediaUploadController.uploadMedia);

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), mediaUploadController.uploadMultipleMedia);

// Delete file
router.delete('/:publicId', mediaUploadController.deleteMedia);

module.exports = router;
