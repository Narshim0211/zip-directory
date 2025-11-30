const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  duration: Number, // in minutes
});

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      default: "",
      trim: true,
    },
    owner: {
  type: String,  // temporarily allow string for testing
  required: false
}
,
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["Salon", "Spa", "Barbershop", "Freelance Stylist"],
      required: true,
    },
    businessType: {
      type: String,
      enum: ["salon", "spa", "freelance"],
      default: "salon",
    },
    description: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    services: [serviceSchema],
    specialties: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // 🛡️ BUSINESS MODERATION FIELDS (V1)
    // Automated quality control for directory listings
    moderationStatus: {
      type: String,
      enum: ["APPROVED", "PENDING", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    moderationIssues: {
      type: [String],
      default: [],
      // Example: ["Missing logo", "Description too short"]
    },
    metadata: {
      ip: {
        type: String,
        default: null,
      },
      lastModeratedAt: {
        type: Date,
        default: null,
      },
      // Google Places ID for seeded businesses
      placeId: {
        type: String,
        default: null,
        sparse: true,
      },
      // Google photo reference for building photo URLs
      photoRef: {
        type: String,
        default: null,
      },
      // Source of the business data
      source: {
        type: String,
        enum: ['manual', 'google_places', 'import'],
        default: 'manual',
      },
      seededAt: {
        type: Date,
        default: null,
      },
    },

    // 🚨 AUTO-FLAGGING FIELDS (Phase 2: Reporting System)
    // Used when community reports trigger auto-hide
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: {
      type: String,
      default: '',
    },
    flaggedAt: {
      type: Date,
      default: null,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    // 📸 Photo Review Count (for "Real Results Shown" badge - FIX #2)
    // Incremented when approved review with photo is submitted
    photoReviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // GeoJSON location for distance-based search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        // Not strictly required to avoid breaking older docs; validated on create path
        required: false,
      },
    },
    // 🔗 Public Booking Profile Fields
    bookingSlug: {
      type: String,
      unique: true,
      sparse: true, // allows null/undefined, but enforces uniqueness when present
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/, // only lowercase letters, numbers, and hyphens
    },
    logoUrl: {
      type: String,
      default: "",
    },
    coverPhotoUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 2000,
      default: "",
    },
    photos: [{
      url: { type: String, required: true },
      caption: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now },
    }],
    videos: [{
      url: { type: String, required: true },
      thumbnail: { type: String, default: "" },
      caption: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now },
    }],
    displayServices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service", // references service IDs to show on public page
    }],
    // Contact information for public profile
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    // Public profile visibility
    isPublicProfileActive: {
      type: Boolean,
      default: false,
    },
    // Staff members (no login required - owner manages all)
    staff: [{
      name: { type: String, required: true },
      role: { type: String, default: "" }, // Stylist, Colorist, etc.
      photoUrl: { type: String, default: "" },
      serviceIds: [{ type: mongoose.Schema.Types.ObjectId }], // Services this staff can perform
      weeklySchedule: {
        monday: [{ start: String, end: String }],
        tuesday: [{ start: String, end: String }],
        wednesday: [{ start: String, end: String }],
        thursday: [{ start: String, end: String }],
        friday: [{ start: String, end: String }],
        saturday: [{ start: String, end: String }],
        sunday: [{ start: String, end: String }],
      },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
    }],
    // Booking settings
    allowCustomerChooseStaff: {
      type: Boolean,
      default: false, // If false, system auto-assigns staff
    },

    // ========================================
    // 🔍 SMART SEARCH ENGINE FIELDS (v1.0)
    // ========================================

    // Service keywords for fuzzy search (e.g., ["braids", "knotless braids", "balayage"])
    serviceKeywords: {
      type: [String],
      default: [],
      index: true,
    },

    // Business hours for "Open Now" filtering
    hours: {
      mon: { type: String, default: "" }, // "09:00-18:00" or "closed"
      tue: { type: String, default: "" },
      wed: { type: String, default: "" },
      thu: { type: String, default: "" },
      fri: { type: String, default: "" },
      sat: { type: String, default: "" },
      sun: { type: String, default: "" },
    },

    // Calculated by cron job every hour
    isOpenNow: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Price level indicator (1=$ 2=$$ 3=$$$ 4=$$$$)
    priceLevel: {
      type: Number,
      min: 1,
      max: 4,
      default: 2, // Default to $$
    },

    // Trending signal - updated by analytics
    viewsLast7Days: {
      type: Number,
      default: 0,
      index: true,
    },

    // Trust signals for ranking boost
    verifiedBadges: {
      type: [String],
      default: [],
      // Examples: ["verified_owner", "verified_location", "verified_phone"]
    },

    // Admin-assigned quality score (0-100)
    qualityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    // ========================================
    // 🎖️ VERIFICATION SYSTEM FIELDS (v1.0)
    // ========================================

    // Overall verification tier
    verificationStatus: {
      type: String,
      enum: ["unverified", "basic", "fully_verified"],
      default: "unverified",
      index: true,
    },

    // Individual verification steps tracking
    verificationSteps: {
      emailVerified: {
        type: Boolean,
        default: false,
      },
      phoneVerified: {
        type: Boolean,
        default: false,
      },
      addressVerified: {
        type: Boolean,
        default: false,
      },
      photosUploaded: {
        type: Number,
        default: 0,
      },
      stripeConnected: {
        type: Boolean,
        default: false,
      },
      documentsUploaded: {
        type: Boolean,
        default: false,
      },
      profileCompleted: {
        type: Number, // Percentage 0-100
        default: 0,
      },
      premiumPlanActive: {
        type: Boolean,
        default: false,
      },
    },

    // Verification metadata
    verificationMeta: {
      lastVerifiedAt: Date,
      verifiedBy: String, // Admin ID if manually verified
      rejectionReason: String, // If verification was rejected
    },

    // Stripe Connect account ID (for customer payment processing)
    stripeAccountId: {
      type: String,
      default: "",
      sparse: true, // Allow multiple null values but enforce uniqueness when present
    },

    // Stripe Customer ID (for platform subscription billing)
    stripeCustomerId: {
      type: String,
      default: "",
      sparse: true,
    },

    // Premium Subscription to Platform (monthly payment to us)
    premiumSubscription: {
      active: {
        type: Boolean,
        default: false,
      },
      subscriptionId: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        enum: ["inactive", "active", "past_due", "canceled", "trialing"],
        default: "inactive",
      },
      currentPeriodEnd: {
        type: Date,
      },
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
    },

    // Listing Type Selection (Free vs Premium)
    listingType: {
      type: String,
      enum: ["free", "premium"],
      default: null,
      sparse: true, // Allows null values, enforces uniqueness for non-null values if needed
    },

    // 🎁 PROMOTIONS SYSTEM (V1 - Lean Edition)
    // Single active promotion per business (Phase 4)
    promotion: {
      title: {
        type: String,
        maxlength: 50,
        trim: true,
        default: '',
      },
      description: {
        type: String,
        maxlength: 120,
        trim: true,
        default: '',
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
        index: true,
      },
      createdAt: {
        type: Date,
        default: null,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
  },
  { timestamps: true }
);

// 📊 Add helpful indexes for faster searches
businessSchema.index({ name: "text", city: "text", category: "text" });
businessSchema.index({ city: 1, category: 1, status: 1 });
businessSchema.index({ state: 1, city: 1, zip: 1 });
businessSchema.index({ location: "2dsphere" });
businessSchema.index({ businessType: 1 });
businessSchema.index({ bookingSlug: 1 }); // fast lookup for public booking pages

// 🔍 Smart Search Engine Indexes (v1.0)
businessSchema.index({ status: 1, isOpenNow: 1 }); // Fast filtering for approved + open businesses
businessSchema.index({ viewsLast7Days: -1 }); // Trending sort
businessSchema.index({ priceLevel: 1, ratingAverage: -1 }); // Price + quality filter

// 🛡️ Moderation Engine Indexes (v1.0)
businessSchema.index({ moderationStatus: 1, createdAt: -1 }); // Fast pending queue queries
businessSchema.index({ 'metadata.ip': 1, createdAt: -1 }); // Spam detection by IP

// 🎁 Promotions Indexes (Phase 4)
businessSchema.index({ 'promotion.expiresAt': 1, 'promotion.isActive': 1 }); // Fast expiry cron queries

// ⚙️ Virtual population (get reviews automatically)
businessSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "business",
});

// 💎 PREMIUM STATUS VIRTUAL (for chat entitlement checks)
businessSchema.virtual('isPremium').get(function() {
  return this.listingType === 'premium' &&
         this.premiumSubscription?.active === true;
});

/**
 * 🌍 UNIVERSAL BEHAVIOR ENFORCEMENT
 * 
 * These helper methods ensure ALL businesses in the directory follow
 * the same access rules:
 * - Soft profiles: Public, no auth required, limited data
 * - Full profiles: Auth required, complete data (excluding owner-only fields)
 * 
 * NO per-business custom logic or exceptions unless explicitly flagged
 * in future versions.
 */

/**
 * Returns soft profile data (public, non-sensitive fields only)
 * Used by: /api/public/directory/search
 * Access: Public (no authentication)
 * 
 * @returns {Object} Soft profile with name, city, category, image, location
 */
businessSchema.methods.toSoftProfileJSON = function() {
  return {
    id: this._id,
    name: this.name,
    city: this.city,
    zip: this.zip,
    category: this.category,
    heroImage: this.coverPhotoUrl || this.logoUrl || '',
    location: this.location,
    promotion: this.promotion?.isActive ? {
      title: this.promotion.title,
      description: this.promotion.description,
      expiresAt: this.promotion.expiresAt
    } : null
  };
};

/**
 * Returns full profile data (all visitor-safe fields)
 * Used by: /api/visitor/business/:id/full
 * Access: Private (authenticated visitors only)
 *
 * @returns {Object} Full profile with contact info, services, hours, etc.
 */
businessSchema.methods.toFullProfileJSON = function() {
  return {
    id: this._id,
    name: this.name,
    city: this.city,
    state: this.state,
    zip: this.zip,
    address: this.address,
    category: this.category,
    businessType: this.businessType,
    description: this.description,
    images: this.images || [],
    logoUrl: this.logoUrl,
    coverPhotoUrl: this.coverPhotoUrl,
    services: this.services || [],
    specialties: this.specialties || [],
    location: this.location,
    phone: this.phone || '',
    email: this.email || '',
    website: this.website || '',
    socialLinks: this.socialLinks || {},
    hours: this.hours || {},
    ratingAverage: this.ratingAverage || 0,
    ratingsCount: this.ratingsCount || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    verificationStatus: this.verificationStatus,
    verificationSteps: this.verificationSteps,
    promotion: this.promotion?.isActive ? {
      title: this.promotion.title,
      description: this.promotion.description,
      expiresAt: this.promotion.expiresAt
    } : null
  };
};

/**
 * 🎖️ VERIFICATION TIER CALCULATION
 *
 * Automatically calculates verification tier based on completed steps.
 * Called after any verification step is updated.
 *
 * Tier Rules:
 * - Unverified: Default state (0-2 steps completed)
 * - Basic: Email + Phone verified, 2+ photos, address confirmed (3-5 steps)
 * - Fully Verified: All basic steps + Stripe connected + profile complete (6+ steps)
 *
 * @returns {String} New verification status
 */
businessSchema.methods.calculateVerificationTier = function() {
  const steps = this.verificationSteps;
  let score = 0;

  // Count completed steps
  if (steps.emailVerified) score += 1;
  if (steps.phoneVerified) score += 1;
  if (steps.addressVerified) score += 1;
  if (steps.photosUploaded >= 2) score += 1;
  if (steps.stripeConnected) score += 1;
  if (steps.documentsUploaded) score += 1;
  if (steps.profileCompleted >= 80) score += 1;

  // Determine tier based on score
  if (score >= 6 && steps.stripeConnected) {
    this.verificationStatus = "fully_verified";
  } else if (score >= 3 && steps.emailVerified && steps.phoneVerified) {
    this.verificationStatus = "basic";
  } else {
    this.verificationStatus = "unverified";
  }

  return this.verificationStatus;
};

/**
 * 📊 PROFILE COMPLETION PERCENTAGE
 *
 * Calculates how complete the business profile is (0-100%)
 * Used to encourage owners to complete their profiles
 *
 * @returns {Number} Completion percentage (0-100)
 */
businessSchema.methods.calculateProfileCompletion = function() {
  let completed = 0;
  const total = 10;

  // Basic info (4 points)
  if (this.name) completed += 1;
  if (this.address) completed += 1;
  if (this.phone) completed += 1;
  if (this.email) completed += 1;

  // Business details (3 points)
  if (this.description && this.description.length > 50) completed += 1;
  if (this.services && this.services.length > 0) completed += 1;
  if (this.hours && Object.values(this.hours).some(h => h && h !== 'closed')) completed += 1;

  // Media (2 points)
  if (this.photos && this.photos.length >= 2) completed += 1;
  if (this.logoUrl || this.coverPhotoUrl) completed += 1;

  // Trust signals (1 point)
  if (this.verificationSteps.stripeConnected) completed += 1;

  const percentage = Math.round((completed / total) * 100);
  this.verificationSteps.profileCompleted = percentage;

  return percentage;
};

/**
 * 🔄 UPDATE VERIFICATION STATUS
 *
 * Convenience method to update verification step and recalculate tier
 *
 * @param {String} step - The step to update (e.g., 'emailVerified')
 * @param {Boolean|Number} value - The new value
 * @returns {Promise<Business>} Updated business document
 */
businessSchema.methods.updateVerificationStep = async function(step, value) {
  if (this.verificationSteps.hasOwnProperty(step)) {
    this.verificationSteps[step] = value;
    this.calculateProfileCompletion();
    this.calculateVerificationTier();
    return await this.save();
  }
  throw new Error(`Invalid verification step: ${step}`);
};

module.exports = mongoose.model("Business", businessSchema);
