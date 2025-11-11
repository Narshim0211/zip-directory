const Survey = require('../models/Survey');
const Follow = require('../models/Follow');
const notificationService = require('../services/notificationService');

const buildSurveyPayload = (survey) => ({
  _id: survey._id,
  id: survey._id,
  question: survey.question,
  options: survey.options,
  totalVotes: survey.totalVotes,
  expiresAt: survey.expiresAt,
  isActive: survey.isActive,
  author: survey.author,
  category: survey.category,
  createdAt: survey.createdAt,
  updatedAt: survey.updatedAt,
});

exports.createSurvey = async (req, res) => {
  try {
    const { question, options, expiresAt, category } = req.body || {};
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }
    const candidate = Array.isArray(options) ? options : [];
    const cleaned = candidate.map((o) => (typeof o === 'string' ? o.trim() : '')).filter(Boolean);
    if (cleaned.length < 2) {
      return res.status(400).json({ message: 'Provide at least two options' });
    }
    const survey = new Survey({
      author: req.user._id,
      question: question.trim(),
      options: cleaned.map((text) => ({ text })),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      category: category?.trim() || 'General',
    });
    await survey.save();

    const followers = await Follow.find({ following: req.user._id }).select('follower');
    await Promise.all(
      followers.map((doc) =>
        notificationService.notifyUser({
          recipientId: doc.follower,
          senderId: req.user._id,
          type: 'new_survey',
          title: 'New survey posted',
          message: `${req.user.name || 'Someone'} asked: ${survey.question}`,
          contentType: 'survey',
          contentId: survey._id,
          link: `/surveys/${survey._id}`,
        })
      )
    );

    await survey.populate('author', 'name avatarUrl role');
    res.status(201).json(buildSurveyPayload(survey));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 5), 50);
    const now = new Date();
    const surveys = await Survey.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name avatarUrl role');
    res.json(surveys.map(buildSurveyPayload));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.vote = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    if (survey.expiresAt && new Date(survey.expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Survey has expired' });
    }
    const optionIndex = Number(req.body.optionIndex);
    if (Number.isNaN(optionIndex) || optionIndex < 0 || optionIndex >= survey.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    const existing = survey.voters.find((v) => String(v.user) === String(req.user._id));
    if (existing && existing.optionIndex === optionIndex) {
      return res.status(200).json({ message: 'Vote already recorded' });
    }
    if (existing) {
      survey.options[existing.optionIndex].votes = Math.max(0, survey.options[existing.optionIndex].votes - 1);
      existing.optionIndex = optionIndex;
    } else {
      survey.voters.push({ user: req.user._id, optionIndex });
      survey.totalVotes += 1;
    }
    survey.options[optionIndex].votes += 1;

    await survey.save();
    await survey.populate('author', 'name avatarUrl role');
    res.json(buildSurveyPayload(survey));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    if (String(survey.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await survey.deleteOne();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const surveys = await Survey.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(surveys.map(buildSurveyPayload));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
