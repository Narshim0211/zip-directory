const Business = require('../models/Business');
const Booking = require('../models/Booking');
const { AppError } = require('../utils/errorHandler');
const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:6002';

/**
 * Generate highlights based on business data (keyword matching)
 */
const generateHighlights = (business) => {
  const highlights = [];
  const bioLower = (business.bio || '').toLowerCase();
  const servicesText = (business.services || []).map(s => s.name.toLowerCase()).join(' ');
  const allText = bioLower + ' ' + servicesText;

  // Check for specialties
  if (allText.includes('balayage')) highlights.push('Balayage Specialist');
  if (allText.includes('color') || allText.includes('highlight')) highlights.push('Color Expert');
  if (allText.includes('extension')) highlights.push('Extension Specialist');
  if (allText.includes('bridal') || allText.includes('wedding')) highlights.push('Bridal Services');
  if (allText.includes('keratin') || allText.includes('treatment')) highlights.push('Treatment Specialist');
  if (allText.includes('vegan') || allText.includes('organic')) highlights.push('Eco-Friendly Products');
  
  // Check experience
  const experienceMatch = bioLower.match(/(\d+)\+?\s*(years?|yrs?)/);
  if (experienceMatch) {
    const years = parseInt(experienceMatch[1]);
    if (years >= 10) highlights.push('10+ Years Experience');
    else if (years >= 5) highlights.push('5+ Years Experience');
  }

  // Check business type
  if (business.category === 'Freelance Stylist') highlights.push('Independent Stylist');
  if (allText.includes('women-owned') || allText.includes('woman owned')) highlights.push('Women-Owned');
  if (allText.includes('lgbtq') || allText.includes('inclusive')) highlights.push('LGBTQ+ Friendly');

  return highlights.slice(0, 6); // max 6 highlights
};

/**
 * @route   GET /api/public/profile/:slug
 * @desc    Get public salon profile by booking slug
 * @access  Public
 */
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find business by booking slug
    const business = await Business.findOne({
      bookingSlug: slug,
      isPublicProfileActive: true
    }).select(
      'name logoUrl coverPhotoUrl bio photos videos services phone email address city state category description ratingAverage ratingsCount hours isOpenNow staff verifiedBadges verificationStatus promotions'
    );

    if (!business) {
      throw new AppError('PROFILE_NOT_FOUND', 'This profile does not exist or is not active.', 404);
    }

    // Generate highlights dynamically
    const highlights = generateHighlights(business);

    // Get recent gallery (last 10 photos)
    const recentGallery = (business.photos || []).slice(-10).reverse();

    // Filter active promotions (within date range)
    const now = new Date();
    const activePromotions = (business.promotions || []).filter(promo =>
      promo.isActive &&
      new Date(promo.startDate) <= now &&
      new Date(promo.endDate) >= now
    );

    // Format response
    const profileData = {
      name: business.name,
      slug: business.bookingSlug,
      logo: business.logoUrl,
      coverPhoto: business.coverPhotoUrl,
      bio: business.bio,
      photos: business.photos || [],
      videos: business.videos || [],
      recentGallery: recentGallery,
      highlights: highlights,
      services: business.services || [],
      contact: {
        phone: business.phone,
        email: business.email,
        address: business.address,
        city: business.city,
        state: business.state,
      },
      category: business.category,
      description: business.description,
      rating: {
        average: business.ratingAverage || 0,
        count: business.ratingsCount || 0,
      },
      // 🆕 New fields for world-class profile
      hours: business.hours || {},
      isOpenNow: business.isOpenNow || false,
      team: (business.staff || []).filter(member => member.isActive).map(member => ({
        name: member.name,
        role: member.role,
        photoUrl: member.photoUrl,
        serviceIds: member.serviceIds,
      })),
      verificationStatus: business.verificationStatus || 'unverified',
      verifiedBadges: business.verifiedBadges || [],
      promotions: activePromotions,
      lastUpdatedAt: business.updatedAt,
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
 * @route   GET /api/public/booking/:slug
 * @desc    Get booking page data (services + availability)
 * @access  Public
 */
exports.getBookingPage = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find business by booking slug
    const business = await Business.findOne({ 
      bookingSlug: slug,
      isPublicProfileActive: true 
    }).select(
      'name logoUrl services phone email address city state owner'
    );

    if (!business) {
      throw new AppError('SALON_NOT_FOUND', 'Booking link not active or does not exist.', 404);
    }

    // Fetch services from booking microservice
    let services = [];
    try {
      if (business.owner) {
        const serviceResponse = await axios.get(
          `${BOOKING_SERVICE_URL}/api/public/services/owner/${business.owner}`,
          {
            timeout: 5000,
            validateStatus: (status) => status < 500, // Don't throw on 4xx errors
          }
        );
        
        if (serviceResponse.data && serviceResponse.data.data) {
          // Filter only active services
          services = serviceResponse.data.data.filter(service => service.isActive !== false);
        }
      }
    } catch (error) {
      console.error('Error fetching services from booking service:', error.message);
      // Fallback to embedded services if microservice is unavailable
      services = business.services || [];
    }

    // Format response
    const bookingData = {
      businessId: business._id,
      name: business.name,
      logo: business.logoUrl,
      services: services,
      contact: {
        phone: business.phone,
        email: business.email,
        address: business.address,
        city: business.city,
        state: business.state,
      },
    };

    res.json({
      success: true,
      data: bookingData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/public/staff/:slug
 * @desc    Get active staff for a booking slug (optionally filtered by service)
 * @access  Public
 */
exports.getStaffBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { serviceId } = req.query;

    // Find business by booking slug
    const business = await Business.findOne({ 
      bookingSlug: slug,
      isPublicProfileActive: true 
    }).select('owner allowCustomerChooseStaff');

    if (!business) {
      throw new AppError('PROFILE_NOT_FOUND', 'This booking page does not exist or is not active.', 404);
    }

    // 🔄 Fetch staff from booking microservice
    let staffList = [];
    try {
      if (serviceId) {
        // Get staff for specific service
        const staffResponse = await axios.get(
          `${BOOKING_SERVICE_URL}/api/public/services/${serviceId}/staff`,
          { timeout: 5000 }
        );
        staffList = staffResponse.data?.data || [];
      } else {
        // Get all staff for owner (no service filter)
        const staffResponse = await axios.get(
          `${BOOKING_SERVICE_URL}/api/staff/owner/${business.owner}`,
          {
            timeout: 5000,
            validateStatus: (status) => status < 500,
          }
        );
        staffList = (staffResponse.data?.data || []).filter(s => s.isActive);
      }
    } catch (error) {
      console.error('Error fetching staff from booking service:', error.message);
      // Return empty array if microservice fails
      staffList = [];
    }

    // Format staff response
    const formattedStaff = staffList.map(s => ({
      _id: s._id,
      name: `${s.firstName} ${s.lastName}`,
      firstName: s.firstName,
      lastName: s.lastName,
      photoUrl: s.avatarUrl,
      specialties: s.specialties || [],
    }));

    res.json({
      success: true,
      data: {
        staff: formattedStaff,
        allowCustomerChooseStaff: business.allowCustomerChooseStaff,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/public/availability/:slug
 * @desc    Get available time slots for booking
 * @access  Public
 */
exports.getAvailability = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { serviceId, staffId, date } = req.query;

    if (!date || !serviceId || !staffId) {
      throw new AppError('VALIDATION_ERROR', 'serviceId, staffId, and date are required.', 400);
    }

    // Find business to validate slug
    const business = await Business.findOne({ 
      bookingSlug: slug,
      isPublicProfileActive: true 
    }).select('_id');

    if (!business) {
      throw new AppError('PROFILE_NOT_FOUND', 'This booking page does not exist or is not active.', 404);
    }

    // 🔄 Fetch availability from booking microservice
    let availableSlots = [];
    try {
      const availabilityResponse = await axios.get(
        `${BOOKING_SERVICE_URL}/api/public/availability`,
        {
          params: { serviceId, staffId, date },
          timeout: 10000,
        }
      );
      
      availableSlots = availabilityResponse.data?.data || [];
    } catch (error) {
      console.error('Error fetching availability from booking service:', error.message);
      
      if (error.response?.status === 404) {
        throw new AppError('RESOURCE_NOT_FOUND', 'Service or staff not found.', 404);
      }
      
      // Return empty slots if microservice fails
      availableSlots = [];
    }

    res.json({
      success: true,
      data: {
        date,
        slots: availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Generate time slots between start and end time
 */
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }
  
  return slots;
}

/**
 * @route   POST /api/public/booking/:slug
 * @desc    Create a new booking/appointment
 * @access  Public
 */
exports.createBooking = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { 
      serviceId, 
      staffId, 
      date, 
      time, 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerNotes 
    } = req.body;

    // Validate required fields
    if (!serviceId || !date || !time || !customerName || !customerEmail || !customerPhone) {
      throw new AppError('VALIDATION_ERROR', 'Missing required booking information.', 400);
    }

    // Find business
    const business = await Business.findOne({ 
      bookingSlug: slug,
      isPublicProfileActive: true 
    }).select('_id staff services allowCustomerChooseStaff');

    if (!business) {
      throw new AppError('PROFILE_NOT_FOUND', 'This booking page does not exist or is not active.', 404);
    }

    // Find the service
    const service = business.services.id(serviceId);
    if (!service) {
      throw new AppError('SERVICE_NOT_FOUND', 'Selected service does not exist.', 404);
    }

    // Determine staff assignment
    let assignedStaff = null;
    
    if (staffId && staffId !== 'any') {
      // Customer selected specific staff
      const staff = business.staff.id(staffId);
      
      if (!staff || !staff.isActive) {
        throw new AppError('STAFF_NOT_FOUND', 'Selected staff member is not available.', 404);
      }

      // Verify staff can perform this service
      if (!staff.serviceIds.some(id => id.toString() === serviceId)) {
        throw new AppError('STAFF_SERVICE_MISMATCH', 'Selected staff cannot perform this service.', 400);
      }

      assignedStaff = {
        staffId: staff._id,
        name: staff.name,
      };
    } else {
      // Auto-assign staff (pick first active staff who can do this service)
      const availableStaff = business.staff.find(s => 
        s.isActive && s.serviceIds.some(id => id.toString() === serviceId)
      );

      if (availableStaff) {
        assignedStaff = {
          staffId: availableStaff._id,
          name: availableStaff.name,
        };
      }
    }

    // Calculate end time
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    // Check for conflicting bookings (same staff, same time, active status)
    if (assignedStaff) {
      const conflictingBooking = await Booking.findOne({
        business: business._id,
        'staff.staffId': assignedStaff.staffId,
        appointmentDate: new Date(date),
        startTime: time,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (conflictingBooking) {
        throw new AppError('TIME_SLOT_UNAVAILABLE', 'This time slot is no longer available.', 409);
      }
    }

    // Create booking
    const booking = await Booking.create({
      business: business._id,
      service: {
        serviceId: service._id,
        name: service.name,
        duration: service.duration,
        price: service.price,
      },
      staff: assignedStaff,
      appointmentDate: new Date(date),
      startTime: time,
      endTime: endTime,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        notes: customerNotes || '',
      },
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: {
        bookingId: booking._id,
        appointmentDate: booking.appointmentDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        service: booking.service.name,
        staff: booking.staff ? booking.staff.name : 'Any available staff',
        status: booking.status,
      },
      message: 'Booking created successfully! You will receive a confirmation email shortly.',
    });
  } catch (error) {
    next(error);
  }
};
