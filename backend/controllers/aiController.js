const aiService = require('../services/aiService');

exports.advice = async (req, res) => {
  try {
    const question = (req.body && String(req.body.question || '').trim()) || ''; 
    const suggestions = await aiService.advise(req.user._id, question);
    res.json({ suggestions });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
