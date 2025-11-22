/**
 * 🔐 OTP SERVICE (v1.0)
 *
 * Handles email and phone verification via OTP codes
 * - Generate 6-digit OTP codes
 * - Store with 10-minute expiration
 * - Send via email (SMS integration can be added later)
 * - Verify codes and update business verification status
 */

const crypto = require('crypto');
const emailService = require('./emailService');
const Business = require('../models/Business');

// In-memory OTP storage (for MVP - move to Redis in production)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP code
 * @returns {String} 6-digit numeric code
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP with expiration (10 minutes)
 * @param {String} key - Email or phone number
 * @param {String} code - The OTP code
 */
function storeOTP(key, code) {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  otpStore.set(key.toLowerCase().trim(), {
    code,
    expiresAt,
    attempts: 0
  });
}

/**
 * Verify OTP code
 * @param {String} key - Email or phone number
 * @param {String} code - The code to verify
 * @returns {Object} { valid: Boolean, message: String }
 */
function verifyOTP(key, code) {
  const normalizedKey = key.toLowerCase().trim();
  const stored = otpStore.get(normalizedKey);

  if (!stored) {
    return { valid: false, message: 'No OTP found. Please request a new code.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedKey);
    return { valid: false, message: 'OTP expired. Please request a new code.' };
  }

  if (stored.attempts >= 5) {
    otpStore.delete(normalizedKey);
    return { valid: false, message: 'Too many failed attempts. Please request a new code.' };
  }

  if (stored.code !== code) {
    stored.attempts += 1;
    return { valid: false, message: 'Invalid OTP code. Please try again.' };
  }

  // Success - delete OTP
  otpStore.delete(normalizedKey);
  return { valid: true, message: 'OTP verified successfully' };
}

/**
 * Send OTP via email
 * @param {String} email - Business email address
 * @param {String} businessId - Business ID for verification
 * @returns {Promise<Object>} { success: Boolean, message: String }
 */
async function sendEmailOTP(email, businessId) {
  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return { success: false, message: 'Business not found' };
    }

    if (business.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, message: 'Email does not match business profile' };
    }

    const code = generateOTP();
    storeOTP(email, code);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E91E63 0%, #F06292 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
          .otp-box { background: #f5f5f5; border: 2px dashed #E91E63; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #E91E63; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${business.name},</h2>
            <p>We received a request to verify your email address for your SalonHub business profile.</p>

            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <div class="otp-code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <p>Enter this code in your SalonHub dashboard to verify your email address.</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't request this verification, please ignore this email. Never share this code with anyone.
            </div>

            <p style="margin-top: 30px;">
              <strong>Why verify your email?</strong><br>
              • Unlock "Basic Verified" badge<br>
              • Improve search ranking<br>
              • Build customer trust
            </p>
          </div>
          <div class="footer">
            <p>SalonHub - Your trusted beauty business directory</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await emailService.sendEmail({
      to: email,
      subject: `${code} is your SalonHub verification code`,
      html
    });

    if (result.success) {
      return {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 600 // 10 minutes in seconds
      };
    }

    return {
      success: false,
      message: 'Failed to send email. Please try again.'
    };

  } catch (error) {
    console.error('Error sending email OTP:', error);
    return {
      success: false,
      message: 'An error occurred while sending OTP'
    };
  }
}

/**
 * Send OTP via phone (email fallback for MVP)
 * @param {String} phone - Business phone number
 * @param {String} businessId - Business ID for verification
 * @returns {Promise<Object>} { success: Boolean, message: String }
 */
async function sendPhoneOTP(phone, businessId) {
  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return { success: false, message: 'Business not found' };
    }

    if (business.phone !== phone) {
      return { success: false, message: 'Phone number does not match business profile' };
    }

    const code = generateOTP();
    storeOTP(phone, code);

    // MVP: Send via email (add Twilio/SMS integration later)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E91E63 0%, #F06292 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
          .otp-box { background: #f5f5f5; border: 2px dashed #E91E63; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #E91E63; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .info { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📱 Verify Your Phone</h1>
          </div>
          <div class="content">
            <h2>Hello ${business.name},</h2>

            <div class="info">
              <strong>ℹ️ Note:</strong> Phone verification code sent to your email temporarily. SMS delivery coming soon!
            </div>

            <p>We received a request to verify your phone number <strong>${phone}</strong> for your SalonHub business profile.</p>

            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <div class="otp-code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <p>Enter this code in your SalonHub dashboard to verify your phone number.</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't request this verification, please ignore this email. Never share this code with anyone.
            </div>

            <p style="margin-top: 30px;">
              <strong>Why verify your phone?</strong><br>
              • Unlock "Basic Verified" badge<br>
              • Customers can call you with confidence<br>
              • Build trust and credibility
            </p>
          </div>
          <div class="footer">
            <p>SalonHub - Your trusted beauty business directory</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await emailService.sendEmail({
      to: business.email, // Send to business email for now
      subject: `${code} is your SalonHub phone verification code`,
      html
    });

    if (result.success) {
      return {
        success: true,
        message: 'OTP sent successfully to your email (SMS coming soon)',
        expiresIn: 600,
        note: 'Code sent to business email temporarily'
      };
    }

    return {
      success: false,
      message: 'Failed to send verification code. Please try again.'
    };

  } catch (error) {
    console.error('Error sending phone OTP:', error);
    return {
      success: false,
      message: 'An error occurred while sending OTP'
    };
  }
}

/**
 * Verify email OTP and update business verification status
 * @param {String} email - Business email
 * @param {String} code - OTP code
 * @param {String} businessId - Business ID
 * @returns {Promise<Object>} { success: Boolean, message: String, business?: Object }
 */
async function verifyEmailOTP(email, code, businessId) {
  try {
    const verification = verifyOTP(email, code);

    if (!verification.valid) {
      return { success: false, message: verification.message };
    }

    // Update business verification status
    const business = await Business.findById(businessId);

    if (!business) {
      return { success: false, message: 'Business not found' };
    }

    await business.updateVerificationStep('emailVerified', true);

    return {
      success: true,
      message: 'Email verified successfully',
      business: {
        verificationStatus: business.verificationStatus,
        verificationSteps: business.verificationSteps
      }
    };

  } catch (error) {
    console.error('Error verifying email OTP:', error);
    return {
      success: false,
      message: 'An error occurred during verification'
    };
  }
}

/**
 * Verify phone OTP and update business verification status
 * @param {String} phone - Business phone
 * @param {String} code - OTP code
 * @param {String} businessId - Business ID
 * @returns {Promise<Object>} { success: Boolean, message: String, business?: Object }
 */
async function verifyPhoneOTP(phone, code, businessId) {
  try {
    const verification = verifyOTP(phone, code);

    if (!verification.valid) {
      return { success: false, message: verification.message };
    }

    // Update business verification status
    const business = await Business.findById(businessId);

    if (!business) {
      return { success: false, message: 'Business not found' };
    }

    await business.updateVerificationStep('phoneVerified', true);

    return {
      success: true,
      message: 'Phone verified successfully',
      business: {
        verificationStatus: business.verificationStatus,
        verificationSteps: business.verificationSteps
      }
    };

  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return {
      success: false,
      message: 'An error occurred during verification'
    };
  }
}

/**
 * Clear expired OTPs (run periodically)
 */
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  sendEmailOTP,
  sendPhoneOTP,
  verifyEmailOTP,
  verifyPhoneOTP,
  generateOTP, // Exported for testing
  cleanupExpiredOTPs // Exported for testing
};
