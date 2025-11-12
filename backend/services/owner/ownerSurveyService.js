const Survey = require("../../models/Survey");
const { createSurvey } = require("../surveyService");

const fetchOwnerSurveys = async (ownerId) => {
  return Survey.find({ author: ownerId }).sort({ createdAt: -1 });
};

const createOwnerSurvey = async (ownerId, payload) => {
  return createSurvey({
    ownerId,
    question: payload.question,
    options: payload.options,
    category: payload.category,
    expiresAt: payload.expiresAt,
    visibility: payload.visibility,
  });
};

module.exports = { fetchOwnerSurveys, createOwnerSurvey };
