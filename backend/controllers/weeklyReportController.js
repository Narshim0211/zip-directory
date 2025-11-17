const weeklyReportService = require("../services/weeklyReportService");

exports.list = async (req, res) => {
  const journeyId = req.query.journeyId || null;
  const reports = await weeklyReportService.listReports(req.user._id, journeyId);
  res.json(reports);
};

exports.getById = async (req, res) => {
  const report = await weeklyReportService.getReportById(req.user._id, req.params.id);
  res.json(report);
};

exports.upsert = async (req, res) => {
  const report = await weeklyReportService.createOrUpdateReport(req.user._id, req.body || {});
  res.status(201).json(report);
};
