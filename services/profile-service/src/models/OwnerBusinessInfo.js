const mongoose = require('mongoose');

/**
 * Owner Business Info Model
 * Per PRD Section 6: Database Structure
 * 
 * Extended business information for owner profiles
 */

const ownerBusinessInfoSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    businessId: {
      type: String,
      index: true,
    },
    
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Services offered (summary - detailed services in booking microservice)
    services: [
      {
        name: String,
        description: String,
      },
    ],
    
    // Staff list (summary - detailed staff management in booking microservice)
    staffList: [
      {
        staffId: String,
        firstName: String,
        lastName: String,
        role: String,
      },
    ],
    
    // Business branding
    brandingColors: {
      primary: String,
      secondary: String,
      accent: String,
    },
    
    // Contact & Location (basic info)
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    
    // Business hours
    hours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OwnerBusinessInfo', ownerBusinessInfoSchema);
