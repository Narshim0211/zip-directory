const Goal = require("../models/Goal");

async function listMyGoals(userId) {
  return Goal.find({ user: userId }).sort({ createdAt: -1 });
}

async function createGoal(userId, payload) {
  const { title, category, targetDate, notes } = payload || {};
  if (!title || !String(title).trim()) {
    const err = new Error("Title is required");
    err.status = 400;
    throw err;
  }
  const goal = new Goal({
    user: userId,
    title: String(title).trim(),
    category: category || "other",
    targetDate: targetDate ? new Date(targetDate) : undefined,
    notes: notes || "",
  });
  return goal.save();
}

async function updateGoal(userId, id, payload) {
  const goal = await Goal.findById(id);
  if (!goal) {
    const err = new Error("Goal not found");
    err.status = 404;
    throw err;
  }
  if (String(goal.user) !== String(userId)) {
    const err = new Error("Not authorized to modify this goal");
    err.status = 403;
    throw err;
  }
  const { title, category, targetDate, notes, status } = payload || {};
  if (title !== undefined) goal.title = String(title).trim();
  if (category !== undefined) goal.category = category;
  if (targetDate !== undefined) goal.targetDate = targetDate ? new Date(targetDate) : undefined;
  if (notes !== undefined) goal.notes = notes;
  if (status !== undefined) goal.status = status;
  return goal.save();
}

async function deleteGoal(userId, id) {
  const goal = await Goal.findById(id);
  if (!goal) {
    const err = new Error("Goal not found");
    err.status = 404;
    throw err;
  }
  if (String(goal.user) !== String(userId)) {
    const err = new Error("Not authorized to delete this goal");
    err.status = 403;
    throw err;
  }
  await goal.deleteOne();
  return { ok: true };
}

module.exports = { listMyGoals, createGoal, updateGoal, deleteGoal };

