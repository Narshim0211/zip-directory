/**
 * 🎖️ VERIFICATION ROUTES (v1.0)
 *
 * Routes for business verification system
 * Base path: /api/v1/verification
 */

const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
// TODO: Add auth middleware when ready
// const { protect } = require('../middleWare/authMiddleware');

/**
 * @route   GET /api/v1/verification/status/:businessId
 * @desc    Get current verification status
 * @access  Private (Owner)
 */
router.get('/status/:businessId', verificationController.getVerificationStatus);

/**
 * @route   PATCH /api/v1/verification/step/:businessId
 * @desc    Update a specific verification step
 * @access  Private (Owner or System)
 * @body    { step: 'emailVerified', value: true }
 */
router.patch('/step/:businessId', verificationController.updateVerificationStep);

/**
 * @route   POST /api/v1/verification/recalculate/:businessId
 * @desc    Manually trigger verification tier recalculation
 * @access  Private (Owner or Admin)
 */
router.post('/recalculate/:businessId', verificationController.recalculateVerification);

/**
 * @route   GET /api/v1/verification/progress/:businessId
 * @desc    Get detailed verification progress with checklist
 * @access  Private (Owner)
 */
router.get('/progress/:businessId', verificationController.getVerificationProgress);

/**
 * @route   POST /api/v1/verification/send-email-otp
 * @desc    Send OTP code to business email
 * @access  Private (Owner)
 * @body    { email: String, businessId: String }
 */
router.post('/send-email-otp', verificationController.sendEmailOTP);

/**
 * @route   POST /api/v1/verification/verify-email-otp
 * @desc    Verify email OTP code and update verification status
 * @access  Private (Owner)
 * @body    { email: String, code: String, businessId: String }
 */
router.post('/verify-email-otp', verificationController.verifyEmailOTP);

/**
 * @route   POST /api/v1/verification/send-phone-otp
 * @desc    Send OTP code to business phone (currently via email)
 * @access  Private (Owner)
 * @body    { phone: String, businessId: String }
 */
router.post('/send-phone-otp', verificationController.sendPhoneOTP);

/**
 * @route   POST /api/v1/verification/verify-phone-otp
 * @desc    Verify phone OTP code and update verification status
 * @access  Private (Owner)
 * @body    { phone: String, code: String, businessId: String }
 */
router.post('/verify-phone-otp', verificationController.verifyPhoneOTP);

module.exports = router;
