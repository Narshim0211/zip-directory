const Business = require('../models/Business');
const Booking = require('../models/Booking');
const OwnerProfile = require('../models/OwnerProfile');

/**
 * Get Dashboard Stats for Money Cards
 * GET /owner/analytics/dashboard
 *
 * Returns 4 key money metrics:
 * 1. Revenue (this month vs last month)
 * 2. Returning client percentage
 * 3. Top service by revenue
 * 4. Active promotion performance
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find owner's business
    const ownerProfile = await OwnerProfile.findOne({ user: ownerId });
    if (!ownerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found'
      });
    }

    const business = await Business.findOne({ owner: ownerId }).select('_id promotion');
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Date ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // This week calculations
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    // 1. REVENUE CALCULATION (This Month vs Last Month)
    const [thisMonthBookings, lastMonthBookings] = await Promise.all([
      Booking.find({
        business: business._id,
        status: 'completed',
        createdAt: { $gte: startOfThisMonth }
      }).select('service.price'),
      Booking.find({
        business: business._id,
        status: 'completed',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).select('service.price')
    ]);

    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);
    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);

    const changePercent = lastMonthRevenue === 0
      ? (thisMonthRevenue > 0 ? 100 : 0)
      : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    // 1.5. BOOKINGS THIS WEEK (for Premium Dashboard)
    const [thisWeekBookings, lastWeekBookings] = await Promise.all([
      Booking.countDocuments({
        business: business._id,
        status: { $in: ['confirmed', 'pending', 'completed'] },
        createdAt: { $gte: startOfThisWeek }
      }),
      Booking.countDocuments({
        business: business._id,
        status: { $in: ['confirmed', 'pending', 'completed'] },
        createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek }
      })
    ]);

    const bookingsChangePercent = lastWeekBookings === 0
      ? (thisWeekBookings > 0 ? 100 : 0)
      : Math.round(((thisWeekBookings - lastWeekBookings) / lastWeekBookings) * 100);

    // 2. RETURNING CLIENTS CALCULATION
    const completedBookingsThisMonth = await Booking.find({
      business: business._id,
      status: 'completed',
      createdAt: { $gte: startOfThisMonth }
    }).select('customer.email createdAt');

    const uniqueEmails = [...new Set(completedBookingsThisMonth.map(b => b.customer?.email).filter(Boolean))];

    let returningCount = 0;
    for (const email of uniqueEmails) {
      const previousBooking = await Booking.findOne({
        business: business._id,
        'customer.email': email,
        status: 'completed',
        createdAt: { $lt: startOfThisMonth }
      });
      if (previousBooking) {
        returningCount++;
      }
    }

    const totalUniqueClients = uniqueEmails.length;
    const returningPercentage = totalUniqueClients === 0
      ? 0
      : Math.round((returningCount / totalUniqueClients) * 100);

    // 3. TOP SERVICE BY REVENUE
    const completedBookings = await Booking.find({
      business: business._id,
      status: 'completed',
      createdAt: { $gte: startOfThisMonth }
    }).select('service.name service.price');

    const serviceRevenue = {};
    completedBookings.forEach(booking => {
      const serviceName = booking.service?.name;
      const price = booking.service?.price || 0;
      if (serviceName) {
        serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + price;
      }
    });

    let topService = { name: '', revenue: 0 };
    Object.entries(serviceRevenue).forEach(([name, revenue]) => {
      if (revenue > topService.revenue) {
        topService = { name, revenue };
      }
    });

    // 4. ACTIVE PROMOTION STATS
    const promotionStats = {
      hasPromotion: business.promotion?.isActive || false,
      title: business.promotion?.title || '',
      bookings: 0,
      views: 0,
      daysLeft: 0,
      upliftPercent: 0
    };

    // If promotion is active, get view/click stats from profile visits
    if (promotionStats.hasPromotion) {
      const ProfileVisit = require('../models/ProfileVisit');
      const promotionStart = business.promotion.createdAt || startOfThisMonth;

      const promotionViews = await ProfileVisit.countDocuments({
        business: business._id,
        createdAt: { $gte: promotionStart }
      });

      const promoBookings = await Booking.countDocuments({
        business: business._id,
        status: { $in: ['confirmed', 'pending', 'completed'] },
        createdAt: { $gte: promotionStart }
      });

      // Calculate days remaining
      if (business.promotion.expiresAt) {
        const msLeft = business.promotion.expiresAt - now;
        promotionStats.daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      }

      promotionStats.views = promotionViews;
      promotionStats.bookings = promoBookings;

      // Calculate uplift (bookings this period vs average)
      const avgBookingsPerWeek = thisWeekBookings || 1;
      promotionStats.upliftPercent = Math.round(((promoBookings - avgBookingsPerWeek) / avgBookingsPerWeek) * 100);
    }

    // 5. UNREAD MESSAGES COUNT (for Premium Dashboard)
    const MessageThread = require('../models/MessageThread');
    const unreadThreads = await MessageThread.countDocuments({
      business: business._id,
      'lastMessage.read': false,
      'lastMessage.sender': { $ne: ownerId }
    });

    return res.status(200).json({
      success: true,
      stats: {
        revenue: {
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          changePercent: changePercent
        },
        bookingsThisWeek: {
          count: thisWeekBookings,
          changePercent: bookingsChangePercent
        },
        returning: {
          percentage: returningPercentage,
          count: returningCount,
          total: totalUniqueClients
        },
        topService: {
          name: topService.name || 'No services yet',
          revenue: topService.revenue,
          bookings: completedBookings.filter(b => b.service?.name === topService.name).length
        },
        promotion: promotionStats,
        messages: {
          unreadCount: unreadThreads
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get Promotion Analytics (Detailed)
 * GET /owner/analytics/promotion
 *
 * Returns detailed promotion performance metrics
 */
exports.getPromotionAnalytics = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const business = await Business.findOne({ owner: ownerId }).select('promotion');
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (!business.promotion || !business.promotion.isActive) {
      return res.status(200).json({
        success: true,
        promotion: {
          active: false,
          message: 'No active promotion'
        }
      });
    }

    // Get promotion performance data
    const ProfileVisit = require('../models/ProfileVisit');
    const promotionStart = business.promotion.createdAt || new Date();

    const views = await ProfileVisit.countDocuments({
      business: business._id,
      createdAt: { $gte: promotionStart }
    });

    const bookings = await Booking.countDocuments({
      business: business._id,
      status: { $in: ['confirmed', 'completed'] },
      createdAt: { $gte: promotionStart }
    });

    // Calculate time remaining
    const now = new Date();
    const expiresAt = business.promotion.expiresAt;
    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
      : null;

    return res.status(200).json({
      success: true,
      promotion: {
        active: true,
        title: business.promotion.title,
        description: business.promotion.description,
        expiresAt: business.promotion.expiresAt,
        daysRemaining: daysRemaining,
        metrics: {
          views: views,
          bookings: bookings,
          conversionRate: views > 0 ? ((bookings / views) * 100).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching promotion analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion analytics',
      error: error.message
    });
  }
};
