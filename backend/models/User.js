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

    // ========================================
    // 💬 CHAT PASS SUBSCRIPTION FIELDS (V2)
    // ========================================
    hasChatPass: {
      type: Boolean,
      default: false,
      index: true, // Fast entitlement checks
    },
    chatPassExpiresAt: {
      type: Date,
      default: null,
    },
    chatPassSubscriptionId: {
      type: String,
      default: '',
    },
    chatPassActivatedAt: {
      type: Date,
      default: null,
    },
    // Grace period tracking (30 days after cancellation)
    chatPassGraceEndsAt: {
      type: Date,
      default: null,
    },

    newsletter: {
      hairTips: {
        type: Boolean,
        default: false,
      },
      businessGrowth: {
        type: Boolean,
        default: false,
      },
    },

    // 🚨 MODERATION FIELDS (Phase 2: Reporting System)
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
    warningCount: {
      type: Number,
      default: 0,
    },
    warnings: [{
      reason: String,
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      issuedAt: {
        type: Date,
        default: Date.now
      }
    }],
    banHistory: [{
      banType: String,
      reason: String,
      bannedAt: Date,
      unbannedAt: Date,
      bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],

    // ✨ REFERRAL TRACKING (Invite System)
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    referralSource: {
      type: String,
      enum: ['direct', 'invite_link', 'organic_share'],
      default: 'direct'
    },
    referredAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for efficient newsletter subscriber queries
userSchema.index({ 'newsletter.hairTips': 1, role: 1 });
userSchema.index({ 'newsletter.businessGrowth': 1, role: 1 });

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
