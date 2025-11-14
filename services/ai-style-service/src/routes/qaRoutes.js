const express = require('express');
const { verifyInternalAuth } = require('../middleware/verifyInternalAuth');
const { rateLimitPerUser } = require('../middleware/rateLimitPerUser');
const asyncWrapper = require('../middleware/asyncWrapper');
const { AppError } = require('../middleware/errorHandler');
const qaService = require('../services/qaService');

const router = express.Router();

router.post(
  '/qa',
  verifyInternalAuth,
  rateLimitPerUser('qa'),
  asyncWrapper(async (req, res) => {
    const question = (req.body?.question || '').trim();
    if (!question) {
      throw new AppError('AI_QUESTION_REQUIRED', 'Ask a question to get advice', 400);
    }

    const answer = await qaService.ask({
      userId: req.userContext.userId,
      question,
    });

    res.json({
      success: true,
      answer,
    });
  })
);

module.exports = router;
