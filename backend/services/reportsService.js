const Report = require('../models/Report');
const Comment = require('../models/Comment');

async function createReport(userId, commentId, reason) {
  if (!reason || !reason.trim()) {
    const err = new Error('Reason is required');
    err.status = 400;
    throw err;
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error('Comment not found');
    err.status = 404;
    throw err;
  }
  const report = new Report({
    comment: commentId,
    reporter: userId,
    reason: reason.trim(),
  });
  return report.save();
}

async function listPending(limit = 20) {
  return Report.find({ status: 'pending' })
    .populate('comment')
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function markHandled(reportId) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');
  report.status = 'handled';
  return report.save();
}

module.exports = { createReport, listPending, markHandled };
