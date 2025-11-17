const express = require('express');
const router = express.Router();
const ownerStaffController = require('../../controllers/ownerStaffController');
const protectOwner = require('../../middleWare/authOwnerMiddleware');

// All routes require owner authentication
router.use(protectOwner);

// Get all staff for owner's business
router.get('/', ownerStaffController.getStaff);

// Add new staff member
router.post('/', ownerStaffController.createStaff);

// Update staff member
router.patch('/:staffId', ownerStaffController.updateStaff);

// Deactivate staff member
router.delete('/:staffId', ownerStaffController.deleteStaff);

// Update staff booking settings
router.patch('/settings/customer-choice', ownerStaffController.updateStaffSettings);

module.exports = router;
