const WeeklyReport = require("../models/WeeklyReport");

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
    .select("week dates emoji feeling note steps highlightProduct createdAt");

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
  } = payload || {};

  if (!week || Number(week) <= 0) {
    const err = new Error("Week number is required");
    err.status = 400;
    throw err;
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
  };

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const result = await WeeklyReport.findOneAndUpdate(filter, update, options);
  return result;
}

module.exports = {
  listReports,
  getReportById,
  createOrUpdateReport,
};
