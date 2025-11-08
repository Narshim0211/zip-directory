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
    address: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["Salon", "Spa", "Barbershop", "Freelance Stylist"],
      required: true,
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
  },
  { timestamps: true }
);

// 📊 Add helpful indexes for faster searches
businessSchema.index({ name: "text", city: "text", category: "text" });
businessSchema.index({ city: 1, category: 1, status: 1 });

// ⚙️ Virtual population (get reviews automatically)
businessSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "business",
});

module.exports = mongoose.model("Business", businessSchema);
