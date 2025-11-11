const Survey = require("../../models/Survey");

const fetchOwnerSurveys = async (ownerId) => {
  return Survey.find({ author: ownerId }).sort({ createdAt: -1 });
};

const createOwnerSurvey = async (ownerId, payload) => {
  const survey = new Survey({
    author: ownerId,
    question: payload.question,
    options: payload.options.map((text) => ({ text })),
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
    category: payload.category || "General",
  });
  await survey.save();
  return survey;
};

module.exports = { fetchOwnerSurveys, createOwnerSurvey };
