const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyUnsubscribeToken } = require('../services/emailService');

/**
 * Public unsubscribe route (no authentication required)
 * GET /api/public/unsubscribe?userId=xxx&token=xxx&type=visitor|owner
 */
router.get('/unsubscribe', async (req, res) => {
  try {
    const { userId, token, type } = req.query;

    if (!userId || !token || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
      });
    }

    if (!['visitor', 'owner'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid newsletter type',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify token
    const isValidToken = verifyUnsubscribeToken(userId, user.email, token);
    if (!isValidToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid unsubscribe token',
      });
    }

    // Unsubscribe user
    if (type === 'visitor') {
      user.newsletter.hairTips = false;
    } else {
      user.newsletter.businessGrowth = false;
    }

    await user.save();

    // Return success HTML page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - SalonHub</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 60px 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1d1d1f;
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 600;
          }
          p {
            color: #6e6e73;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .small-text {
            margin-top: 20px;
            font-size: 14px;
            color: #86868b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>You've Been Unsubscribed</h1>
          <p>
            You've successfully unsubscribed from 
            ${type === 'visitor' ? 'Hair Tips' : 'Business Growth'} emails.
            We're sorry to see you go!
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">
            Return to SalonHub
          </a>
          <p class="small-text">
            You can re-subscribe anytime from your account settings.
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - SalonHub</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 60px 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1d1d1f;
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 600;
          }
          p {
            color: #6e6e73;
            font-size: 16px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Something Went Wrong</h1>
          <p>
            We couldn't process your unsubscribe request. Please try again later
            or contact support if the problem persists.
          </p>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
