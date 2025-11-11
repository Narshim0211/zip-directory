const ownerSurveyService = require("../../services/owner/ownerSurveyService");

const listSurveys = async (req, res) => {
  const surveys = await ownerSurveyService.fetchOwnerSurveys(req.user._id);
  res.json(surveys);
};

const createSurvey = async (req, res) => {
  const { question, options, expiresAt, category } = req.body || {};
  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "Provide question and at least two options" });
  }
  const survey = await ownerSurveyService.createOwnerSurvey(req.user._id, {
    question,
    options,
    expiresAt,
    category,
  });
  res.status(201).json(survey);
};

module.exports = { listSurveys, createSurvey };
