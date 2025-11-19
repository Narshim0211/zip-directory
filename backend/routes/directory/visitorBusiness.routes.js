/**
 * Visitor Business Routes
 * Routes accessible only to authenticated visitors
 * Returns full profile data
 * NO duplication with public/owner routes
 */

const express = require('express');
const router = express.Router();
const visitorBusinessController = require('../../controllers/directory/visitorBusiness.controller');
const protectVisitor = require('../../middleWare/authVisitorMiddleware');

// Apply visitor authentication to all routes in this router
router.use(protectVisitor);

// @route   GET /api/visitor/business/:id/full
// @desc    Get full business profile
// @access  Private (Visitor only)
router.get('/:id/full', visitorBusinessController.getFullProfile);

// @route   GET /api/visitor/business/nearby
// @desc    Get nearby businesses with full details
// @access  Private (Visitor only)
router.get('/nearby', visitorBusinessController.getNearbyBusinesses);

module.exports = router;
