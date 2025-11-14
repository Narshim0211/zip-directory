const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["visitor", "owner", "admin"],
      default: "visitor",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
      },
    ],
    avatarUrl: {
      type: String,
      default: "",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "past_due"],
      default: "inactive",
    },
    subscriptionPlan: {
      type: String,
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
  },
  { timestamps: true }
);

// ✅ Automatically hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
