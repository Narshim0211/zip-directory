const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * ReminderLog Schema
 * Tracks all reminder delivery attempts (successful and failed)
 * Useful for debugging, analytics, and compliance
 */
const reminderLogSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    taskDate: {
      type: Date,
      required: true,
    },
    reminderTime: {
      type: String,
      required: true,
    },
    // Delivery channels attempted
    emailAttempted: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailRecipient: {
      type: String,
    },
    emailError: {
      type: String,
    },
    smsAttempted: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    smsRecipient: {
      type: String,
    },
    smsError: {
      type: String,
    },
    // Overall status
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      required: true,
    },
    // Timing
    attemptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    // Metadata
    retryCount: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
reminderLogSchema.index({ userId: 1, attemptedAt: -1 });
reminderLogSchema.index({ taskId: 1, attemptedAt: -1 });
reminderLogSchema.index({ status: 1, attemptedAt: -1 });

/**
 * Static method to log a reminder attempt
 */
reminderLogSchema.statics.logAttempt = async function (task, result) {
  const emailAttempted = !!(task.reminder?.email && process.env.SENDGRID_API_KEY);
  const smsAttempted = !!(task.reminder?.phone && process.env.TWILIO_SID);

  const emailSent = result.emailSent || false;
  const smsSent = result.smsSent || false;

  let status = "failed";
  if (emailSent && smsSent) {
    status = "success";
  } else if (emailSent || smsSent) {
    status = emailAttempted && smsAttempted ? "partial" : "success";
  }

  const log = new this({
    taskId: task._id,
    userId: task.userId,
    taskTitle: task.title,
    taskDate: task.taskDate,
    reminderTime: task.reminder?.time,
    emailAttempted,
    emailSent,
    emailRecipient: task.reminder?.email,
    emailError: result.results?.email?.error,
    smsAttempted,
    smsSent,
    smsRecipient: task.reminder?.phone,
    smsError: result.results?.sms?.error,
    status,
    attemptedAt: new Date(),
    sentAt: status !== "failed" ? new Date() : null,
    failureReason:
      status === "failed"
        ? [result.results?.email?.error, result.results?.sms?.error].filter(Boolean).join("; ")
        : null,
  });

  await log.save();
  return log;
};

/**
 * Get reminder statistics for a user
 */
reminderLogSchema.statics.getUserStats = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        attemptedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const success = stats.find((s) => s._id === "success")?.count || 0;
  const partial = stats.find((s) => s._id === "partial")?.count || 0;
  const failed = stats.find((s) => s._id === "failed")?.count || 0;

  return {
    total,
    success,
    partial,
    failed,
    successRate: total > 0 ? ((success + partial) / total) * 100 : 0,
  };
};

module.exports = mongoose.model("ReminderLog", reminderLogSchema);
