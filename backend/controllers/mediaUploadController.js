const cloudinary = require('../config/cloudinary');
const { AppError } = require('../utils/errorHandler');

/**
 * Upload single file to Cloudinary
 * @route   POST /api/owner/media/upload
 * @access  Private (Owner)
 */
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('NO_FILE', 'No file uploaded', 400);
    }

    // Determine resource type based on mimetype
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    // Upload to Cloudinary using buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'salonhub/booking-profiles',
          resource_type: resourceType,
          transformation: resourceType === 'image' 
            ? [
                { width: 1920, height: 1080, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: resourceType,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.bytes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple files to Cloudinary
 * @route   POST /api/owner/media/upload-multiple
 * @access  Private (Owner)
 */
exports.uploadMultipleMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('NO_FILES', 'No files uploaded', 400);
    }

    // Upload all files in parallel
    const uploadPromises = req.files.map(async (file) => {
      const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'salonhub/booking-profiles',
            resource_type: resourceType,
            transformation: resourceType === 'image'
              ? [
                  { width: 1920, height: 1080, crop: 'limit' },
                  { quality: 'auto' },
                  { fetch_format: 'auto' }
                ]
              : undefined,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              publicId: result.public_id,
              resourceType: resourceType,
              format: result.format,
              width: result.width,
              height: result.height,
              size: result.bytes,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: uploadResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete file from Cloudinary
 * @route   DELETE /api/owner/media/:publicId
 * @access  Private (Owner)
 */
exports.deleteMedia = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      throw new AppError('MISSING_PUBLIC_ID', 'Public ID is required', 400);
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok') {
      throw new AppError('DELETE_FAILED', 'Failed to delete file', 500);
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
