const express = require("express");
const router = express.Router();
const { triggerManualCheck } = require("../services/reminderScheduler");
const ReminderLog = require("../shared/models/ReminderLog");
const VisitorTask = require("../visitor/time/models/Task");
const OwnerTask = require("../owner/time/models/Task");

/**
 * POST /api/reminders/test
 * Manually trigger reminder check (for testing)
 */
router.post("/test", async (req, res) => {
  try {
    await triggerManualCheck();
    res.json({
      success: true,
      message: "Manual reminder check triggered",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reminders/history
 * Get reminder history for authenticated user
 */
router.get("/history", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const logs = await ReminderLog.find({ userId })
      .sort({ attemptedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reminders/stats
 * Get reminder statistics for user
 */
router.get("/stats", async (req, res) => {
  try {
    const { userId, days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const stats = await ReminderLog.getUserStats(userId, parseInt(days));

    res.json({
      success: true,
      period: `Last ${days} days`,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reminders/pending
 * Get all pending reminders for user
 */
router.get("/pending", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const visitorTasks = await VisitorTask.find({
      userId,
      "reminder.sent": false,
      "reminder.time": { $exists: true },
    }).select("title taskDate reminder");

    const ownerTasks = await OwnerTask.find({
      userId,
      "reminder.sent": false,
      "reminder.time": { $exists: true },
    }).select("title taskDate reminder");

    const allPending = [...visitorTasks, ...ownerTasks];

    res.json({
      success: true,
      count: allPending.length,
      reminders: allPending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/reminders/:taskId/retry
 * Retry sending a failed reminder
 */
router.post("/:taskId/retry", async (req, res) => {
  try {
    const { taskId } = req.params;

    // Try visitor tasks first
    let task = await VisitorTask.findById(taskId);
    if (!task) {
      task = await OwnerTask.findById(taskId);
    }

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.reminder) {
      return res.status(400).json({ error: "Task has no reminder" });
    }

    // Reset sent flag to allow retry
    task.reminder.sent = false;
    task.reminder.failureReason = null;
    await task.save();

    // Trigger manual check
    await triggerManualCheck();

    res.json({
      success: true,
      message: "Reminder retry triggered",
      taskId: task._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
