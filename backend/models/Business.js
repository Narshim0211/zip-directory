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
  },
  { timestamps: true }
);

// 📊 Add helpful indexes for faster searches
businessSchema.index({ name: "text", city: "text", category: "text" });
businessSchema.index({ city: 1, category: 1, status: 1 });
businessSchema.index({ state: 1, city: 1, zip: 1 });
businessSchema.index({ location: "2dsphere" });
businessSchema.index({ businessType: 1 });

// ⚙️ Virtual population (get reviews automatically)
businessSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "business",
});

module.exports = mongoose.model("Business", businessSchema);
