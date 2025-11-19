const Feedback = require('../models/Feedback');
const logger = require('../utils/logger');

/**
 * @desc    Submit visitor feedback
 * @route   POST /api/visitor/feedback
 * @access  Private (Visitor only)
 */
const submitVisitorFeedback = async (req, res) => {
  try {
    const { category, title, description } = req.validatedData;
    const userId = req.user._id;

    const feedback = await Feedback.create({
      userId,
      userType: 'visitor',
      category,
      title,
      description
    });

    logger.info(`✅ Visitor feedback submitted: ${feedback._id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted.',
      data: {
        id: feedback._id,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    logger.error(`❌ Error submitting visitor feedback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Submit owner feedback
 * @route   POST /api/owner/feedback
 * @access  Private (Owner only)
 */
const submitOwnerFeedback = async (req, res) => {
  try {
    const { category, urgency, title, description } = req.validatedData;
    const userId = req.user._id;

    const feedback = await Feedback.create({
      userId,
      userType: 'owner',
      category,
      urgency: urgency || 'MEDIUM',
      title,
      description
    });

    logger.info(`✅ Owner feedback submitted: ${feedback._id} by user ${userId} (Urgency: ${feedback.urgency})`);

    res.status(201).json({
      success: true,
      message: 'Your feedback has been submitted. We\'ll get back to you soon.',
      data: {
        id: feedback._id,
        status: feedback.status,
        urgency: feedback.urgency,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    logger.error(`❌ Error submitting owner feedback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all feedback with filters (admin only)
 * @route   GET /api/admin/feedback
 * @access  Private (Admin only)
 * @query   userType (visitor|owner), status (OPEN|IN_REVIEW|RESOLVED), page, limit
 */
const getAllFeedback = async (req, res) => {
  try {
    const { userType, status, page = 1, limit = 20, search } = req.query;

    // Build filter object
    const filter = {};
    if (userType && ['visitor', 'owner'].includes(userType)) {
      filter.userType = userType;
    }
    if (status && ['OPEN', 'IN_REVIEW', 'RESOLVED'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    // Get feedback with user details (name, email, firstName, lastName for full contact info)
    const feedbackList = await Feedback.find(filter)
      .populate('userId', 'name email firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Enrich feedback with user contact info for admin
    const enrichedFeedback = feedbackList.map(fb => {
      const user = fb.userId;
      return {
        ...fb,
        user: user ? {
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          email: user.email || 'No email',
          role: user.role
        } : {
          name: 'Deleted User',
          email: 'N/A',
          role: fb.userType
        }
      };
    });

    // Get counts by type and status for UI badges
    const counts = await Feedback.aggregate([
      {
        $facet: {
          byType: [
            { $group: { _id: '$userType', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const typeCounts = counts[0].byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const statusCounts = counts[0].byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: enrichedFeedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      counts: {
        visitor: typeCounts.visitor || 0,
        owner: typeCounts.owner || 0,
        open: statusCounts.OPEN || 0,
        inReview: statusCounts.IN_REVIEW || 0,
        resolved: statusCounts.RESOLVED || 0,
        total
      }
    });
  } catch (error) {
    logger.error(`❌ Error fetching feedback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update feedback status and internal notes
 * @route   PATCH /api/admin/feedback/:id
 * @access  Private (Admin only)
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.validatedData;

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update fields
    if (status) {
      feedback.status = status;
    }
    if (internalNotes !== undefined) {
      feedback.internalNotes = internalNotes;
    }

    await feedback.save();

    logger.info(`✅ Feedback ${id} updated by admin ${req.user._id} - Status: ${feedback.status}`);

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: {
        id: feedback._id,
        status: feedback.status,
        internalNotes: feedback.internalNotes,
        resolvedAt: feedback.resolvedAt,
        updatedAt: feedback.updatedAt
      }
    });
  } catch (error) {
    logger.error(`❌ Error updating feedback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitVisitorFeedback,
  submitOwnerFeedback,
  getAllFeedback,
  updateFeedbackStatus
};
