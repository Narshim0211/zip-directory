const taskService = require("../services/taskService");

const getDailyTasks = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    // Parse the date correctly for querying
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    
    // DEBUG: Log the query parameters
    console.log(`🔍 Fetching daily tasks for user: ${req.user._id}, date: ${targetDate.toISOString()}`);
    
    const tasks = await taskService.listTasks({
      userId: req.user._id,
      scope: "daily",
      date: targetDate,
    });
    
    // DEBUG: Log reminder data being returned
    console.log(`📬 Found ${tasks.length} total tasks`);
    
    // Check each task's reminder status
    tasks.forEach((task, index) => {
      console.log(`Task ${index + 1}: "${task.title}" - reminder: ${task.reminder ? 'YES' : 'NO'}`);
      if (task.reminder) {
        console.log(`  → Reminder details:`, JSON.stringify(task.reminder, null, 2));
      }
    });
    
    const tasksWithReminders = tasks.filter(t => t.reminder);
    console.log(`📊 Summary: ${tasksWithReminders.length} tasks have reminders`);
    
    res.json(tasks);
  } catch (error) {
    console.error("❌ Daily tasks error", error);
    next(error);
  }
};

const createDailyTask = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    console.log("📝 CREATE TASK REQUEST:");
    console.log("  - Title:", req.body.title);
    console.log("  - Session:", req.body.session);
    console.log("  - Reminder payload:", JSON.stringify(req.body.reminder, null, 2));
    
    // Set taskDate to start of today (midnight) for proper date matching
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const payload = {
      scope: "daily",
      taskDate: today,
      ...req.body,
    };
    
    console.log("  - TaskDate being saved:", today.toISOString());
    
    console.log("📦 Final payload being saved:", JSON.stringify({
      title: payload.title,
      reminder: payload.reminder
    }, null, 2));
    
    const task = await taskService.createTask({ userId: req.user._id, payload });
    
    // DEBUG: Log what was actually saved to database
    console.log("✅ Task created in database:");
    console.log("  - ID:", task._id);
    console.log("  - Title:", task.title);
    console.log("  - Reminder in DB:", task.reminder ? JSON.stringify(task.reminder, null, 2) : "NULL");
    console.log("  - Full task object keys:", Object.keys(task.toObject ? task.toObject() : task));
    
    res.json(task);
  } catch (error) {
    console.error("❌ Error creating task:", error);
    next(error);
  }
};

const updateDailyTask = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const task = await taskService.updateTask({
      taskId: req.params.id,
      updates: req.body,
    });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

const deleteDailyTask = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    await taskService.deleteTask({ taskId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
};
