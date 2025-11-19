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
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
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

// ⚙️ Virtual population (get reviews automatically)
businessSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "business",
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
    location: this.location
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
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model("Business", businessSchema);
