const Business = require('../models/Business');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

/**
 * @route   GET /api/owner/booking-profile
 * @desc    Get owner's booking profile
 * @access  Private (Owner)
 */
exports.getBookingProfile = async (req, res, next) => {
  try {
    // Find business owned by this user
    const business = await Business.findOne({ owner: req.user._id });

    // If no business exists, return empty profile structure instead of error
    if (!business) {
      return res.json({
        success: true,
        data: {
          businessId: null,
          name: '',
          bookingSlug: '',
          logoUrl: '',
          coverPhotoUrl: '',
          bio: '',
          photos: [],
          videos: [],
          services: [],
          displayServices: [],
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          isPublicProfileActive: false,
        },
      });
    }

    const profileData = {
      businessId: business._id,
      name: business.name,
      bookingSlug: business.bookingSlug || '',
      logoUrl: business.logoUrl || '',
      coverPhotoUrl: business.coverPhotoUrl || '',
      bio: business.bio || '',
      photos: business.photos || [],
      videos: business.videos || [],
      services: business.services || [],
      displayServices: business.displayServices || [],
      phone: business.phone || '',
      email: business.email || '',
      address: business.address || '',
      city: business.city || '',
      state: business.state || '',
      isPublicProfileActive: business.isPublicProfileActive || false,
    };

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/booking-profile
 * @desc    Update booking profile (logo, bio, photos, videos, etc.)
 * @access  Private (Owner)
 */
exports.updateBookingProfile = async (req, res, next) => {
  try {
    const { 
      logoUrl, 
      coverPhotoUrl, 
      bio, 
      photos, 
      videos, 
      phone, 
      email,
      displayServices,
      isPublicProfileActive
    } = req.body;

    // Find business owned by this user
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    // Validate bio length
    if (bio !== undefined && bio.length > 300) {
      throw new AppError('VALIDATION_ERROR', 'Bio must be 300 characters or less.', 400);
    }

    // Update fields
    if (logoUrl !== undefined) business.logoUrl = logoUrl;
    if (coverPhotoUrl !== undefined) business.coverPhotoUrl = coverPhotoUrl;
    if (bio !== undefined) business.bio = bio;
    if (photos !== undefined) business.photos = photos;
    if (videos !== undefined) business.videos = videos;
    if (phone !== undefined) business.phone = phone;
    if (email !== undefined) business.email = email;
    if (displayServices !== undefined) business.displayServices = displayServices;
    if (isPublicProfileActive !== undefined) business.isPublicProfileActive = isPublicProfileActive;

    // Ensure location coordinates exist for geospatial index (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates [longitude, latitude]
      };
    }

    // updatedAt will be set automatically by mongoose timestamps
    await business.save();

    res.json({
      success: true,
      message: 'Booking profile updated successfully.',
      data: {
        logoUrl: business.logoUrl,
        coverPhotoUrl: business.coverPhotoUrl,
        bio: business.bio,
        photos: business.photos,
        videos: business.videos,
        phone: business.phone,
        email: business.email,
        displayServices: business.displayServices,
        isPublicProfileActive: business.isPublicProfileActive,
        lastUpdatedAt: business.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/booking-slug
 * @desc    Update booking slug (unique handle)
 * @access  Private (Owner)
 */
exports.updateBookingSlug = async (req, res, next) => {
  try {
    const { slug } = req.body;

    if (!slug) {
      throw new AppError('INVALID_SLUG', 'Booking slug is required.', 400);
    }

    // Validate slug format (lowercase letters, numbers, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      throw new AppError(
        'INVALID_SLUG',
        'Slug can only contain lowercase letters, numbers, and hyphens.',
        400
      );
    }

    // Check if slug is already taken
    const existingBusiness = await Business.findOne({ bookingSlug: slug });
    if (existingBusiness && existingBusiness.owner.toString() !== req.user._id.toString()) {
      throw new AppError('SLUG_TAKEN', 'This booking handle is already taken.', 409);
    }

    // Find and update business
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    business.bookingSlug = slug.toLowerCase();
    
    // Ensure location coordinates exist for geospatial index (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates [longitude, latitude]
      };
    }
    
    await business.save();

    res.json({
      success: true,
      message: 'Booking slug updated successfully.',
      data: {
        bookingSlug: business.bookingSlug,
        publicUrl: `${process.env.WEB_ORIGIN || 'http://localhost:3000'}/profile/${business.bookingSlug}`,
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return next(new AppError('SLUG_TAKEN', 'This booking handle is already taken.', 409));
    }
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/booking-profile/services
 * @desc    Toggle which services to show on public booking page
 * @access  Private (Owner)
 */
exports.toggleServiceVisibility = async (req, res, next) => {
  try {
    const { serviceIds } = req.body;

    if (!Array.isArray(serviceIds)) {
      throw new AppError('INVALID_INPUT', 'serviceIds must be an array.', 400);
    }

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    // Update display services
    business.displayServices = serviceIds;
    await business.save();

    res.json({
      success: true,
      message: 'Service visibility updated.',
      data: {
        displayServices: business.displayServices,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/booking-profile/activate
 * @desc    Toggle public profile activation
 * @access  Private (Owner)
 */
exports.togglePublicProfile = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new AppError('INVALID_INPUT', 'isActive must be a boolean.', 400);
    }

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    // Check if required fields are filled
    if (isActive && !business.bookingSlug) {
      throw new AppError(
        'INCOMPLETE_PROFILE',
        'Cannot activate profile without a booking slug.',
        400
      );
    }

    business.isPublicProfileActive = isActive;
    
    // Ensure location coordinates exist for geospatial index (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates [longitude, latitude]
      };
    }
    
    await business.save();

    res.json({
      success: true,
      message: `Public profile ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        isPublicProfileActive: business.isPublicProfileActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
