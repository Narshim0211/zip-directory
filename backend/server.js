const express = require('express');
const detectPort = require('detect-port');
const http = require('http');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
const logger = require('./utils/logger');
const errorHandler = require('./middleWare/errorMiddleware');
require('dotenv').config();
const stripeWebhookRoutes = require('./routes/stripeWebhookRoutes');

// Middleware
const cors = require('cors');

// CORS allowlist: main site + admin + local dev
const rawOrigins = [
  process.env.WEB_ORIGIN,      // e.g. https://salonhub.com
  process.env.ADMIN_ORIGIN,    // e.g. https://admin.salonhub.com
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const allowlist = new Set(rawOrigins);
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (allowlist.has(origin) || localhostRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use('/webhooks', stripeWebhookRoutes);
// Express 5 (path-to-regexp v6): use a RegExp or omit path.
// Handle preflight for all routes using a RegExp that matches anything.
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));

// Health check
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'SalonHub API is working' });
});

// Routes
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const businessRoutes = require('./routes/business.Route');
app.use('/api/businesses', businessRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// News & Activity
const newsRoutes = require('./routes/newsRoutes');
app.use('/api/news', newsRoutes);

require('./cron/newsCron');

// Surveys & Feed
const surveyRoutes = require('./routes/surveyRoutes');
app.use('/api/surveys', surveyRoutes);
const feedRoutes = require('./routes/feedRoutes');
app.use('/api/feed', feedRoutes);

// V1 API routes
const v1FeedRoutes = require('./routes/v1/feedRoutes');
app.use('/api/v1/feed', v1FeedRoutes);

const v1VisitorSurveyRoutes = require('./routes/v1/visitor/surveyRoutes');
app.use('/api/v1/visitor/surveys', v1VisitorSurveyRoutes);

const v1OwnerSurveyRoutes = require('./routes/v1/owner/surveyRoutes');
app.use('/api/v1/owner/surveys', v1OwnerSurveyRoutes);

const v1OwnerPostRoutes = require('./routes/v1/owner/postRoutes');
app.use('/api/v1/owner/posts', v1OwnerPostRoutes);

// V1 owner profiles (public + owner)
const v1OwnerProfilesRoutes = require('./routes/v1/ownerProfiles.routes');
app.use('/api/v1/owner-profiles', v1OwnerProfilesRoutes);

// V1 visitor profiles
const v1VisitorProfilesRoutes = require('./routes/v1/visitorProfiles.routes');
app.use('/api/v1/visitor-profiles', v1VisitorProfilesRoutes);

// V2 API routes (Facebook-style profiles)
const v2OwnerProfilesRoutes = require('./routes/v2/ownerProfiles.routes');
app.use('/api/v2/owner-profiles', v2OwnerProfilesRoutes);

const v2VisitorProfilesRoutes = require('./routes/v2/visitorProfiles.routes');
app.use('/api/v2/visitor-profiles', v2VisitorProfilesRoutes);

// Owner routes
const ownerRoutes = require('./routes/ownerRoutes');
app.use('/api/owner', ownerRoutes);
// Owner profile routes (role-isolated)
try {
  const ownerProfileRoutes = require('./routes/owner/profileRoutes');
  app.use('/api/owner/profile', ownerProfileRoutes);
} catch (e) {
  logger.warn('Owner profile routes not loaded:', e.message);
}

// Follow
const followRoutes = require('./routes/followRoutes');
app.use('/api/follow', followRoutes);

// Profile Resolver (unified profile lookup across roles)
const profileResolverRoutes = require('./routes/profileResolverRoutes');
app.use('/api/profile', profileResolverRoutes);

// Posts & Comments
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

// Goals
const goalsRoutes = require('./routes/goalsRoutes');
app.use('/api/goals', goalsRoutes);

// Style inspiration
const stylesRoutes = require('./routes/stylesRoutes');
app.use('/api/styles', stylesRoutes);

// Articles feed
const articlesRoutes = require('./routes/articlesRoutes');
app.use('/api/articles', articlesRoutes);

// AI advisor
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const styleAdvisorRoutes = require('./routes/styleAdvisorRoutes');
app.use('/api/visitor/style', styleAdvisorRoutes);

const toolkitRoutes = require('./routes/toolkitRoutes');
app.use('/api/visitor/toolkit', toolkitRoutes);

const visitorTimeRoutes = require('./visitor/time/routes/timeRoutes');
app.use('/api/visitor/time-manager', visitorTimeRoutes);

const ownerTimeRoutes = require('./owner/time/routes/timeRoutes');
app.use('/api/owner/time-manager', ownerTimeRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/comments/reports', reportRoutes);

// Time Manager: Proxy to Time Microservice
const { timeProxy } = require('./middleWare/timeProxy');
app.use('/api/visitor/time', timeProxy('/visitor/time'));
app.use('/api/owner/time', timeProxy('/owner/time'));

// Import reminder cron functions before calling them
const { startVisitorReminderCron } = require('./visitor/time/cron/reminderCron');
const { startOwnerReminderCron } = require('./owner/time/cron/reminderCron');

startVisitorReminderCron();
startOwnerReminderCron();

// Notifications
const { initNotificationSocket } = require('./services/notificationSocket');
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);


// Microservices Proxy Gateway Routes
// Per PRD Section 8: Frontend → Main Backend → Microservices
const profileProxyRoutes = require('./routes/profileProxyRoutes');
app.use('/api/profiles-service', profileProxyRoutes);

const bookingProxyRoutes = require('./routes/bookingProxyRoutes');
app.use('/api/booking-service', bookingProxyRoutes);

const paymentProxyRoutes = require('./routes/paymentProxyRoutes');
app.use('/api/payment-service', paymentProxyRoutes);

// Dev-only: Seed an admin user if missing
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/seed-admin', async (req, res) => {
    try {
      const email = (req.body && req.body.email) || 'admin@example.com';
      const password = (req.body && req.body.password) || 'admin123';
      const name = (req.body && req.body.name) || 'Admin';

      let user = await User.findOne({ email });
      if (user) {
        const wasAdmin = user.role === 'admin';
        if (!wasAdmin) {
          user.role = 'admin';
          await user.save();
        }
        return res.json({
          seeded: false,
          updatedRole: !wasAdmin,
          id: user._id,
          email: user.email,
          role: user.role,
        });
      }

      user = new User({ name, email, password, role: 'admin' });
      await user.save();
      return res.status(201).json({
        seeded: true,
        id: user._id,
        email: user.email,
        role: user.role,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });
}


// Start server (export app for Vercel serverless)
const PORT = Number(process.env.PORT || 5000);
if (process.env.VERCEL) {
  module.exports = app; // Vercel will handle the serverless function
} else {
const createServerInstance = () => {
  const server = http.createServer(app);
  initNotificationSocket(server, rawOrigins);
  return server;
};

const startServer = async (port) => {
  const freePort = await detectPort(port);
  if (freePort !== port) {
    logger.warn(`Port ${port} already in use, switching to ${freePort}.`);
  }

  const server = createServerInstance();
  const handleError = (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${freePort} became unavailable.`);
    } else {
      logger.error("Unexpected server error", err);
    }
    process.exit(1);
  };

  server.once("error", handleError);
  server.listen(freePort, () => {
    server.off("error", handleError);
    logger.info(`Server running on http://localhost:${freePort}`);
  });
};

startServer(PORT);
}

app.use(errorHandler);

