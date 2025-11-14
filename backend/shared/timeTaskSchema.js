const { Schema } = require("mongoose");

const createTimeTaskSchema = () =>
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, required: true, index: true },
      title: { type: String, required: true, trim: true },
      description: { type: String, trim: true, default: "" },
      scope: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        required: true,
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      duration: { type: Number, default: 30 },
      session: { type: String, enum: ["morning", "afternoon", "evening"], default: "morning" },
      taskDate: { type: Date, required: true, index: true },
      completed: { type: Boolean, default: false },
      reminderEnabled: { type: Boolean, default: false },
      reminderTime: { type: String },
      reminderDelivered: { type: Boolean, default: false },
      deliveryMethods: [{ type: String, enum: ["email", "sms"] }],
      reminderContactEmail: { type: String },
      reminderContactPhone: { type: String },
      reminderSentAt: { type: Date },
    },
    { timestamps: true }
  );

module.exports = { createTimeTaskSchema };
