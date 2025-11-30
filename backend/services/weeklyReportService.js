const WeeklyReport = require("../models/WeeklyReport");
const communityStatsService = require("./communityStatsService");

const buildFilter = (userId, journeyId) => {
  const filter = { user: userId };
  if (journeyId) {
    filter.journeyId = journeyId;
  }
  return filter;
};

const calculateConsistency = (steps = []) => {
  const totals = steps.reduce(
    (acc, step) => {
      acc.done += Number(step.done || 0);
      acc.target += Number(step.target || 0);
      return acc;
    },
    { done: 0, target: 0 }
  );
  if (totals.target <= 0) return 0;
  return Math.min(1, totals.done / totals.target);
};

async function listReports(userId, journeyId) {
  const filter = buildFilter(userId, journeyId);
  const reports = await WeeklyReport.find(filter)
    .sort({ week: 1 })
    .select("week dates emoji feeling note steps highlightProduct checkIn goal createdAt");

  return reports.map((report) => {
    const consistency = calculateConsistency(report.steps);
    return {
      _id: report._id,
      week: report.week,
      dates: report.dates,
      emoji: report.emoji,
      feeling: report.feeling,
      note: report.note,
      highlightProduct: report.highlightProduct,
      checkIn: report.checkIn || null,
      goal: report.goal || null,
      hasCheckIn: !!report.checkIn?.healthRating,
      consistency,
      createdAt: report.createdAt,
    };
  });
}

async function getReportById(userId, reportId) {
  const report = await WeeklyReport.findOne({ _id: reportId, user: userId });
  if (!report) {
    const err = new Error("Report not found");
    err.status = 404;
    throw err;
  }

  const filter = buildFilter(userId, report.journeyId);
  const sibling = await WeeklyReport.find(filter).sort({ week: 1 }).select("_id week");
  const prev = sibling.find((r) => r.week === report.week - 1);
  const next = sibling.find((r) => r.week === report.week + 1);

  return {
    ...report.toObject(),
    consistency: calculateConsistency(report.steps),
    prevId: prev?._id || null,
    nextId: next?._id || null,
  };
}

async function createOrUpdateReport(userId, payload) {
  const {
    week,
    journeyId = null,
    dates,
    feeling,
    emoji,
    note,
    steps = [],
    highlightProduct,
    photos = [],
    goal = null, // User's hair goal (e.g., 'length', 'repair')
    checkIn = null, // Report Card check-in data (Q1-Q5)
  } = payload || {};

  if (!week || Number(week) <= 0) {
    const err = new Error("Week number is required");
    err.status = 400;
    throw err;
  }

  // Validate checkIn if provided - all 5 questions are required
  if (checkIn) {
    const { healthRating, goalProgress, whatHelped, whatHarmed, proudMoment } = checkIn;

    // Q1: Health rating (1-5) - required
    if (typeof healthRating !== 'number' || healthRating < 1 || healthRating > 5) {
      const err = new Error("Health rating must be a number between 1 and 5");
      err.status = 400;
      throw err;
    }

    // Q2: Goal progress - required
    const validProgress = ['none', 'little', 'noticeable'];
    if (!goalProgress || !validProgress.includes(goalProgress)) {
      const err = new Error("Goal progress must be one of: none, little, noticeable");
      err.status = 400;
      throw err;
    }

    // Q3: What helped - required (array, can be empty but must exist)
    if (!Array.isArray(whatHelped)) {
      const err = new Error("What helped must be an array");
      err.status = 400;
      throw err;
    }

    // Q4: What harmed - required (array, can be empty but must exist)
    if (!Array.isArray(whatHarmed)) {
      const err = new Error("What harmed must be an array");
      err.status = 400;
      throw err;
    }

    // Q5: Proud moment - required (can be empty string)
    if (typeof proudMoment !== 'string') {
      const err = new Error("Proud moment must be a string");
      err.status = 400;
      throw err;
    }

    // Limit selections to max 2 items
    if (whatHelped.length > 2) {
      const err = new Error("Maximum 2 items allowed for what helped");
      err.status = 400;
      throw err;
    }
    if (whatHarmed.length > 2) {
      const err = new Error("Maximum 2 items allowed for what harmed");
      err.status = 400;
      throw err;
    }
  }

  const filter = { user: userId, journeyId, week };
  const update = {
    dates: dates || {},
    feeling: feeling || null,
    emoji: emoji || null,
    note: note || "",
    steps,
    highlightProduct: highlightProduct || null,
    photos,
    goal: goal || null,
    checkIn: checkIn || null,
  };

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const result = await WeeklyReport.findOneAndUpdate(filter, update, options);

  // Record anonymous community stat (non-blocking)
  // Only if we have a goal and steps to record
  if (goal && steps.length > 0) {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.done > 0).length;
    const completionPercent = totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

    // Extract step types for anonymous tracking
    const stepTypes = steps
      .filter(s => s.done > 0 && s.label)
      .map(s => s.label)
      .slice(0, 10); // Limit to 10

    // Map feeling to standardized values
    const hairFeelingMap = {
      'terrible': 'terrible',
      'bad': 'bad',
      'okay': 'okay',
      'good': 'good',
      'great': 'great',
      'amazing': 'amazing'
    };
    const hairFeeling = hairFeelingMap[feeling?.toLowerCase()] || null;

    // Fire and forget - don't block the response
    communityStatsService.recordAnonymousStat({
      goal,
      weekNumber: week,
      completionPercent,
      totalSteps,
      completedSteps,
      stepTypes,
      hairFeeling
    }).catch(err => {
      // Silently log - don't let stats failure affect the main save
      console.error('Failed to record anonymous stat:', err.message);
    });
  }

  return result;
}

module.exports = {
  listReports,
  getReportById,
  createOrUpdateReport,
};
