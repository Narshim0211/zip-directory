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

    console.log('📋 Survey Creation Request:', { question, options, category });

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const candidate = Array.isArray(options) ? options : [];
    const cleaned = candidate
      .map((o) => (typeof o === 'string' ? o.trim() : (o?.label || o?.text || '')))
      .filter(Boolean);

    console.log('✅ Cleaned options:', cleaned);

    if (cleaned.length < 2) {
      return res.status(400).json({ message: 'Provide at least two options' });
    }

    const formattedOptions = cleaned.map((text, index) => ({
      id: `opt-${index}`,
      label: text,
    }));

    console.log('📊 Formatted options:', formattedOptions);

    const survey = new Survey({
      author: req.user._id,
      question: question.trim(),
      options: formattedOptions,
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
      // attach identity projection
      const feedService = require('../services/feedService');
      const mapped = surveys.map(s => ({ type: 'survey', data: s.toObject ? s.toObject() : s }));
      await feedService.attachIdentities(mapped);
      res.json(mapped.map(m => ({ ...buildSurveyPayload(m.data), identity: m.identity })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.vote = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    // Check if survey is expired
    if (survey.expiresAt && new Date(survey.expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Survey has expired' });
    }

    // Support both optionId (new) and optionIndex (legacy)
    const { optionId, optionIndex: legacyIndex } = req.body;

    let optionIndex;
    if (optionId) {
      // Find by optionId
      optionIndex = survey.options.findIndex(opt => opt.id === optionId);
      if (optionIndex === -1) {
        return res.status(400).json({ message: 'Invalid option ID' });
      }
    } else if (legacyIndex !== undefined) {
      // Legacy: use optionIndex directly
      optionIndex = Number(legacyIndex);
      if (Number.isNaN(optionIndex) || optionIndex < 0 || optionIndex >= survey.options.length) {
        return res.status(400).json({ message: 'Invalid option index' });
      }
    } else {
      return res.status(400).json({ message: 'optionId or optionIndex required' });
    }

    // Check if user already voted
    const existing = survey.voters.find((v) => String(v.user) === String(req.user._id));
    if (existing) {
      // User already voted - return 409 Conflict
      return res.status(409).json({ message: 'Already voted', survey: buildSurveyPayload(survey) });
    }

    // Record the vote
    survey.voters.push({ user: req.user._id, optionIndex });
    survey.totalVotes += 1;
    survey.options[optionIndex].votes += 1;

    await survey.save();
    await survey.populate('author', 'name avatarUrl role');
    const feedService = require('../services/feedService');
    const m = { type: 'survey', data: survey.toObject ? survey.toObject() : survey };
    await feedService.attachIdentities([m]);
    res.json({ ok: true, survey: { ...buildSurveyPayload(m.data), identity: m.identity } });
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
