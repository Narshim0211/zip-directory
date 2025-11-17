const Business = require('../models/Business');
const { AppError } = require('../utils/errorHandler');

/**
 * @route   GET /api/owner/staff
 * @desc    Get all staff for owner's business
 * @access  Private (Owner)
 */
exports.getStaff = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    res.json({
      success: true,
      data: {
        staff: business.staff || [],
        allowCustomerChooseStaff: business.allowCustomerChooseStaff || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/owner/staff
 * @desc    Add new staff member
 * @access  Private (Owner)
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { name, role, photoUrl, serviceIds, weeklySchedule } = req.body;

    if (!name) {
      throw new AppError('VALIDATION_ERROR', 'Staff name is required.', 400);
    }

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    const newStaff = {
      name,
      role: role || '',
      photoUrl: photoUrl || '',
      serviceIds: serviceIds || [],
      weeklySchedule: weeklySchedule || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
      isActive: true,
    };

    business.staff.push(newStaff);

    // Ensure location coordinates exist (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }

    await business.save();

    const addedStaff = business.staff[business.staff.length - 1];

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully.',
      data: addedStaff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/staff/:staffId
 * @desc    Update staff member
 * @access  Private (Owner)
 */
exports.updateStaff = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { name, role, photoUrl, serviceIds, weeklySchedule, isActive } = req.body;

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    const staffMember = business.staff.id(staffId);

    if (!staffMember) {
      throw new AppError('STAFF_NOT_FOUND', 'Staff member not found.', 404);
    }

    // Update fields
    if (name !== undefined) staffMember.name = name;
    if (role !== undefined) staffMember.role = role;
    if (photoUrl !== undefined) staffMember.photoUrl = photoUrl;
    if (serviceIds !== undefined) staffMember.serviceIds = serviceIds;
    if (weeklySchedule !== undefined) staffMember.weeklySchedule = weeklySchedule;
    if (isActive !== undefined) staffMember.isActive = isActive;

    // Ensure location coordinates exist (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }

    await business.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully.',
      data: staffMember,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/owner/staff/:staffId
 * @desc    Deactivate/remove staff member
 * @access  Private (Owner)
 */
exports.deleteStaff = async (req, res, next) => {
  try {
    const { staffId } = req.params;

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    const staffMember = business.staff.id(staffId);

    if (!staffMember) {
      throw new AppError('STAFF_NOT_FOUND', 'Staff member not found.', 404);
    }

    // Soft delete: set isActive to false
    staffMember.isActive = false;

    // Ensure location coordinates exist (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }

    await business.save();

    res.json({
      success: true,
      message: 'Staff member deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/staff-settings
 * @desc    Update staff booking settings
 * @access  Private (Owner)
 */
exports.updateStaffSettings = async (req, res, next) => {
  try {
    const { allowCustomerChooseStaff } = req.body;

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'No business found for this owner.', 404);
    }

    if (allowCustomerChooseStaff !== undefined) {
      business.allowCustomerChooseStaff = allowCustomerChooseStaff;
    }

    // Ensure location coordinates exist (fix MongoDB error)
    if (!business.location || !business.location.coordinates || business.location.coordinates.length === 0) {
      business.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }

    await business.save();

    res.json({
      success: true,
      message: 'Staff settings updated successfully.',
      data: {
        allowCustomerChooseStaff: business.allowCustomerChooseStaff,
      },
    });
  } catch (error) {
    next(error);
  }
};
