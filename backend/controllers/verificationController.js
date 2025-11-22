/**
 * 🎖️ VERIFICATION CONTROLLER (v1.0)
 *
 * Handles all business verification-related operations:
 * - Get verification status
 * - Update verification steps
 * - Calculate verification tier
 * - Get verification progress
 *
 * Routes: /api/v1/verification/*
 */

const Business = require('../models/Business');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../core/errors/globalErrorHandler').AppError;
const otpService = require('../services/otpService');

/**
 * @route   GET /api/v1/verification/status/:businessId
 * @desc    Get current verification status for a business
 * @access  Private (Owner only)
 */
exports.getVerificationStatus = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // TODO: Add owner authorization check
  // if (business.owner.toString() !== req.user.id) {
  //   return next(new AppError('Not authorized to view this business verification', 403));
  // }

  // Calculate latest profile completion
  business.calculateProfileCompletion();
  business.calculateVerificationTier();
  await business.save();

  res.status(200).json({
    success: true,
    data: {
      verificationStatus: business.verificationStatus,
      verificationSteps: business.verificationSteps,
      profileCompletion: business.verificationSteps.profileCompleted,
      tier: business.verificationStatus,
      nextSteps: getNextSteps(business)
    }
  });
});

/**
 * @route   PATCH /api/v1/verification/step/:businessId
 * @desc    Update a specific verification step
 * @access  Private (Owner or System)
 */
exports.updateVerificationStep = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;
  const { step, value } = req.body;

  if (!step || value === undefined) {
    return next(new AppError('Step name and value are required', 400));
  }

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Update the verification step
  await business.updateVerificationStep(step, value);

  res.status(200).json({
    success: true,
    message: `Verification step "${step}" updated successfully`,
    data: {
      verificationStatus: business.verificationStatus,
      verificationSteps: business.verificationSteps,
      profileCompletion: business.verificationSteps.profileCompleted
    }
  });
});

/**
 * @route   POST /api/v1/verification/recalculate/:businessId
 * @desc    Manually trigger verification tier recalculation
 * @access  Private (Owner or Admin)
 */
exports.recalculateVerification = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Recalculate
  business.calculateProfileCompletion();
  const newTier = business.calculateVerificationTier();
  await business.save();

  res.status(200).json({
    success: true,
    message: 'Verification tier recalculated',
    data: {
      previousTier: req.body.previousTier || 'unknown',
      newTier: newTier,
      verificationSteps: business.verificationSteps,
      profileCompletion: business.verificationSteps.profileCompleted
    }
  });
});

/**
 * @route   GET /api/v1/verification/progress/:businessId
 * @desc    Get detailed verification progress with checklist
 * @access  Private (Owner only)
 */
exports.getVerificationProgress = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Update calculations
  business.calculateProfileCompletion();
  business.calculateVerificationTier();

  const progress = {
    currentTier: business.verificationStatus,
    profileCompletion: business.verificationSteps.profileCompleted,
    steps: {
      emailVerified: {
        completed: business.verificationSteps.emailVerified,
        title: 'Verify Email Address',
        description: 'Confirm your business email with OTP code'
      },
      phoneVerified: {
        completed: business.verificationSteps.phoneVerified,
        title: 'Verify Phone Number',
        description: 'Confirm your business phone with OTP code'
      },
      addressVerified: {
        completed: business.verificationSteps.addressVerified,
        title: 'Confirm Business Address',
        description: 'Verify your physical business location'
      },
      photosUploaded: {
        completed: business.verificationSteps.photosUploaded >= 2,
        current: business.verificationSteps.photosUploaded,
        required: 2,
        title: 'Upload Business Photos',
        description: 'Add at least 2 high-quality photos of your business'
      },
      stripeConnected: {
        completed: business.verificationSteps.stripeConnected,
        title: 'Connect Stripe Account',
        description: 'Set up payment processing to accept online bookings'
      },
      profileCompleted: {
        completed: business.verificationSteps.profileCompleted >= 80,
        current: business.verificationSteps.profileCompleted,
        required: 80,
        title: 'Complete Business Profile',
        description: 'Fill out all business details (hours, services, description)'
      }
    },
    nextSteps: getNextSteps(business),
    benefits: getBenefitsByTier(business.verificationStatus)
  };

  res.status(200).json({
    success: true,
    data: progress
  });
});

/**
 * Helper: Get next recommended steps based on current status
 */
function getNextSteps(business) {
  const steps = business.verificationSteps;
  const recommendations = [];

  if (!steps.emailVerified) {
    recommendations.push({
      priority: 'high',
      action: 'verify_email',
      title: 'Verify Your Email',
      description: 'Click the verification link sent to your email'
    });
  }

  if (!steps.phoneVerified) {
    recommendations.push({
      priority: 'high',
      action: 'verify_phone',
      title: 'Verify Your Phone',
      description: 'Enter the OTP code sent to your phone'
    });
  }

  if (steps.photosUploaded < 2) {
    recommendations.push({
      priority: 'medium',
      action: 'upload_photos',
      title: 'Add Business Photos',
      description: `Upload ${2 - steps.photosUploaded} more photo(s)`
    });
  }

  if (!steps.addressVerified) {
    recommendations.push({
      priority: 'medium',
      action: 'verify_address',
      title: 'Confirm Your Address',
      description: 'Verify your business location'
    });
  }

  if (!steps.stripeConnected && business.verificationStatus === 'basic') {
    recommendations.push({
      priority: 'high',
      action: 'connect_stripe',
      title: 'Connect Stripe for Payments',
      description: 'Enable online payment processing to reach "Fully Verified" status'
    });
  }

  if (steps.profileCompleted < 80) {
    recommendations.push({
      priority: 'low',
      action: 'complete_profile',
      title: 'Complete Your Profile',
      description: `Your profile is ${steps.profileCompleted}% complete`
    });
  }

  return recommendations.slice(0, 3); // Return top 3 priorities
}

/**
 * Helper: Get benefits explanation for each tier
 */
function getBenefitsByTier(tier) {
  const benefits = {
    unverified: [
      'Basic listing in directory',
      'Limited visibility in search results'
    ],
    basic: [
      'Verified business badge',
      'Improved search ranking',
      'Contact information visible',
      'Photo gallery enabled'
    ],
    fully_verified: [
      'Premium verified badge',
      'Top position in search results',
      'Accept online payments',
      'Access to booking system',
      'Recommended to visitors',
      'Stripe-verified payments'
    ]
  };

  return benefits[tier] || [];
}

/**
 * @route   POST /api/v1/verification/send-email-otp
 * @desc    Send OTP code to business email
 * @access  Private (Owner only)
 */
exports.sendEmailOTP = catchAsync(async (req, res, next) => {
  const { email, businessId } = req.body;

  if (!email || !businessId) {
    return next(new AppError('Email and businessId are required', 400));
  }

  const result = await otpService.sendEmailOTP(email, businessId);

  if (!result.success) {
    return next(new AppError(result.message, 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    expiresIn: result.expiresIn
  });
});

/**
 * @route   POST /api/v1/verification/verify-email-otp
 * @desc    Verify email OTP code
 * @access  Private (Owner only)
 */
exports.verifyEmailOTP = catchAsync(async (req, res, next) => {
  const { email, code, businessId } = req.body;

  if (!email || !code || !businessId) {
    return next(new AppError('Email, code, and businessId are required', 400));
  }

  const result = await otpService.verifyEmailOTP(email, code, businessId);

  if (!result.success) {
    return next(new AppError(result.message, 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    data: result.business
  });
});

/**
 * @route   POST /api/v1/verification/send-phone-otp
 * @desc    Send OTP code to business phone
 * @access  Private (Owner only)
 */
exports.sendPhoneOTP = catchAsync(async (req, res, next) => {
  const { phone, businessId } = req.body;

  if (!phone || !businessId) {
    return next(new AppError('Phone and businessId are required', 400));
  }

  const result = await otpService.sendPhoneOTP(phone, businessId);

  if (!result.success) {
    return next(new AppError(result.message, 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    expiresIn: result.expiresIn,
    note: result.note
  });
});

/**
 * @route   POST /api/v1/verification/verify-phone-otp
 * @desc    Verify phone OTP code
 * @access  Private (Owner only)
 */
exports.verifyPhoneOTP = catchAsync(async (req, res, next) => {
  const { phone, code, businessId } = req.body;

  if (!phone || !code || !businessId) {
    return next(new AppError('Phone, code, and businessId are required', 400));
  }

  const result = await otpService.verifyPhoneOTP(phone, code, businessId);

  if (!result.success) {
    return next(new AppError(result.message, 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    data: result.business
  });
});
