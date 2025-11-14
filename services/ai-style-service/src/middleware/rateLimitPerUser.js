const UsageCounter = require('../models/UsageCounter');
const { AppError } = require('./errorHandler');
const { env } = require('../config/env');

const PLAN_LIMITS = {
  basic: { visualMonthly: 100, visualDaily: 10, qaMonthly: 200, perMinute: 5 },
  pro: { visualMonthly: 400, visualDaily: 40, qaMonthly: 800, perMinute: 10 },
};

const shortTermCache = new Map();

const bumpShortTerm = (userId, featureType, limit) => {
  const key = `${userId}:${featureType}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const existing = shortTermCache.get(key) || [];
  const filtered = existing.filter((ts) => now - ts < windowMs);
  filtered.push(now);
  shortTermCache.set(key, filtered);
  if (filtered.length > limit) {
    throw new AppError(
      'AI_RATE_LIMIT_SHORT_TERM',
      'Too many requests right now. Please wait a moment and try again.',
      429
    );
  }
};

const rateLimitPerUser = (featureType) =>
  async function rateLimitMiddleware(req, res, next) {
    const { userId, planType } = req.userContext || {};
    if (!userId) {
      throw new AppError('AI_USER_CONTEXT_MISSING', 'User context is required', 400);
    }

    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.basic;
    bumpShortTerm(userId, featureType, limits.perMinute || env.planDefaults.perMinute);

    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const dayKey = now.toISOString().slice(0, 10);
    const usage = await UsageCounter.findOneAndUpdate(
      { userId, month: monthKey },
      {
        $setOnInsert: {
          month: monthKey,
          dailyKey: dayKey,
          visualCount: 0,
          qaCount: 0,
          dailyVisualCount: 0,
        },
      },
      { new: true, upsert: true }
    );

    if (usage.dailyKey !== dayKey) {
      usage.dailyKey = dayKey;
      usage.dailyVisualCount = 0;
    }

    if (featureType === 'visual') {
      if (usage.visualCount >= (limits.visualMonthly || env.planDefaults.visualMonthly)) {
        throw new AppError(
          'AI_RATE_LIMIT_EXCEEDED',
          'You have reached your monthly visual preview limit.',
          429
        );
      }
      if (usage.dailyVisualCount >= (limits.visualDaily || env.planDefaults.visualDaily)) {
        throw new AppError(
          'AI_RATE_LIMIT_DAILY_EXCEEDED',
          'Daily visual preview limit reached. Try again tomorrow.',
          429
        );
      }
      usage.visualCount += 1;
      usage.dailyVisualCount += 1;
    } else {
      if (usage.qaCount >= (limits.qaMonthly || env.planDefaults.qaMonthly)) {
        throw new AppError(
          'AI_RATE_LIMIT_EXCEEDED',
          'You have reached your monthly Q&A limit.',
          429
        );
      }
      usage.qaCount += 1;
    }

    await usage.save();
    next();
  };

module.exports = { rateLimitPerUser };
