const reportsService = require('../services/reportsService');
const notificationService = require('../services/notificationService');

exports.create = async (req, res) => {
  try {
    const { commentId, reason } = req.body || {};
    const report = await reportsService.createReport(req.user._id, commentId, reason);
    const comment = report.comment || await require('../models/Comment').findById(commentId);
    try {
      if (comment && comment.userId) {
        await notificationService.notifyUser({
          recipientId: comment.userId,
          senderId: req.user._id,
          type: 'comment_report',
          title: 'Comment reported',
          message: `Your comment was reported: ${reason}`,
          contentType: comment.contentType || 'post',
          contentId: comment.contentId || null,
          link: comment.contentType === 'business' ? `/business/${comment.contentId}` : '',
        });
      }
    } catch (err) {
      console.error('notify report', err.message);
    }
    res.status(201).json(report);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.listPending = async (req, res) => {
  try {
    const items = await reportsService.listPending();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handle = async (req, res) => {
  try {
    const handled = await reportsService.markHandled(req.params.id);
    res.json({ ok: true, report: handled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
