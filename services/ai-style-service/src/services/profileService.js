const BeautyProfile = require('../models/BeautyProfile');

async function get(userId) {
  const profile = await BeautyProfile.findOne({ userId });
  return profile ? profile.toObject() : null;
}

async function upsert(userId, payload) {
  const update = {
    hairType: payload.hairType,
    hairLength: payload.hairLength,
    skinTone: payload.skinTone,
    styleGoal: payload.styleGoal,
    budget: payload.budget,
    maintenance: payload.maintenance,
  };

  const profile = await BeautyProfile.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return profile.toObject();
}

module.exports = { get, upsert };
