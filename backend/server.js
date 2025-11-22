// Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express');
const detectPort = require('detect-port');
const http = require('http');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
const logger = require('./utils/logger');
const errorHandler = require('./middleWare/errorMiddleware');
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// DEBUG: Log ALL incoming requests
app.use((req, res, next) => {
  console.log(`🌐 [REQUEST] ${req.method} ${req.path}`);
  next();
});

app.use('/webhooks', stripeWebhookRoutes);
// Express 5 (path-to-regexp v6): use a RegExp or omit path.
// Handle preflight for all routes using a RegExp that matches anything.
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
    
    // Start reminder schedulers after DB connection (wrapped in try-catch)
    try {
      const { startVisitorReminderCron } = require('./visitor/time/cron/reminderCron');
      const { startOwnerReminderCron } = require('./owner/time/cron/reminderCron');

      startVisitorReminderCron();
      startOwnerReminderCron();
      logger.info('Reminder schedulers started');
    } catch (err) {
      logger.warn('Reminder schedulers failed to start:', err.message);
    }

    // Start Smart Search cron jobs (Open Now updater)
    try {
      const { initializeCronJobs } = require('./lib/cron/scheduler');
      initializeCronJobs();
      logger.info('Smart Search cron jobs started');
    } catch (err) {
      logger.warn('Smart Search cron jobs failed to start:', err.message);
    }
    
    // Verify email service configuration (non-blocking, suppressed)
    try {
      const { verifyEmailService } = require('./services/emailService');
      verifyEmailService().catch(err => {
        // Silently log - don't let this crash the server
        logger.warn('Email service verification skipped (non-critical)');
      });
    } catch (err) {
      logger.warn('Email service initialization skipped');
    }
  })
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

const v1UserRoutes = require('./routes/v1/userRoutes');
app.use('/api/v1/users', v1UserRoutes);

const v1VisitorSurveyRoutes = require('./routes/v1/visitor/surveyRoutes');
app.use('/api/v1/visitor/surveys', v1VisitorSurveyRoutes);

const v1OwnerSurveyRoutes = require('./routes/v1/owner/surveyRoutes');
app.use('/api/v1/owner/surveys', v1OwnerSurveyRoutes);

const v1OwnerPostRoutes = require('./routes/v1/owner/postRoutes');
app.use('/api/v1/owner/posts', v1OwnerPostRoutes);

const v1OwnerFollowRoutes = require('./routes/v1/owner/followRoutes');
app.use('/api/v1/owner/follow', v1OwnerFollowRoutes);

// Unified Follow Routes (works for all user types)
const v1FollowRoutes = require('./routes/v1/followRoutes');
app.use('/api/v1/follow', v1FollowRoutes);

// Unified Profile Resolver Routes (works for all user types)
const profileResolverRoutes = require('./routes/profileResolverRoutes');
app.use('/api/profile', profileResolverRoutes);

// V1 owner profiles (public + owner)
const v1OwnerProfilesRoutes = require('./routes/v1/ownerProfiles.routes');
app.use('/api/v1/owner-profiles', v1OwnerProfilesRoutes);

// V1 visitor profiles
const v1VisitorProfilesRoutes = require('./routes/v1/visitorProfiles.routes');
app.use('/api/v1/visitor-profiles', v1VisitorProfilesRoutes);

// V1 Analytics (Engagement Metrics System)
const analyticsRoutes = require('./modules/analytics');
app.use('/api/v1/analytics', analyticsRoutes);

// Directory Routes (Public Soft Profiles + Visitor Full Profiles)
const publicDirectoryRoutes = require('./routes/directory/publicDirectory.routes');
const visitorBusinessRoutes = require('./routes/directory/visitorBusiness.routes');
app.use('/api/public/directory', publicDirectoryRoutes);
app.use('/api/visitor/business', visitorBusinessRoutes);

// Smart Search Routes (v1.0)
const searchRoutes = require('./routes/search.Route');
app.use('/api/search', searchRoutes);

// Verification Routes (v1.0)
const verificationRoutes = require('./routes/verification.routes');
app.use('/api/v1/verification', verificationRoutes);

// Stripe Connect Routes (v1.0)
const stripeConnectRoutes = require('./routes/stripeConnect.routes');
app.use('/api/v1/stripe-connect', stripeConnectRoutes);

// Premium Subscription Routes (v1.0)
const premiumRoutes = require('./routes/premium.routes');
app.use('/api/v1/premium', premiumRoutes);

// Health & Monitoring Routes
const healthRoutes = require('./routes/health.routes');
app.use('/api/health', healthRoutes);

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
// Owner booking profile routes
try {
  const ownerBookingProfileRoutes = require('./routes/owner/bookingProfileRoutes');
  app.use('/api/owner', ownerBookingProfileRoutes);
} catch (e) {
  logger.warn('Owner booking profile routes not loaded:', e.message);
}
// Owner media upload routes
try {
  const mediaUploadRoutes = require('./routes/owner/mediaUploadRoutes');
  app.use('/api/owner/media', mediaUploadRoutes);
} catch (e) {
  logger.warn('Owner media upload routes not loaded:', e.message);
}
// NOTE: Old staff and booking routes removed - now using microservice architecture
// All booking/staff operations go through /api/booking-service/* proxy

// Posts & Comments
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

// Goals
const goalsRoutes = require('./routes/goalsRoutes');
app.use('/api/goals', goalsRoutes);

// Reminders
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);

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

// Hair Goals: Weekly reports
const weeklyReportRoutes = require('./routes/weeklyReportRoutes');
app.use('/api/hair-goals/reports', weeklyReportRoutes);

// Public Booking Routes (no authentication required)
const publicBookingRoutes = require('./routes/publicBookingRoutes');
app.use('/api/public', publicBookingRoutes);

// Time Manager: Proxy to Time Microservice
const { timeProxy } = require('./middleWare/timeProxy');
app.use('/api/visitor/time', timeProxy('/visitor/time'));
app.use('/api/owner/time', timeProxy('/owner/time'));

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

// Feedback Routes (Visitor, Owner, Admin)
const visitorFeedbackRoutes = require('./routes/visitor/feedbackRoutes');
app.use('/api/visitor/feedback', visitorFeedbackRoutes);

const ownerFeedbackRoutes = require('./routes/owner/feedbackRoutes');
app.use('/api/owner/feedback', ownerFeedbackRoutes);

const adminFeedbackRoutes = require('./routes/admin/feedbackRoutes');
app.use('/api/admin/feedback', adminFeedbackRoutes);

// Newsletter Routes (Visitor, Owner, Admin)
const visitorNewsletterRoutes = require('./routes/visitor/newsletterRoutes');
app.use('/api/visitor/newsletter', visitorNewsletterRoutes);

const ownerNewsletterRoutes = require('./routes/owner/newsletterRoutes');
app.use('/api/owner/newsletter', ownerNewsletterRoutes);

const adminNewsletterRoutes = require('./routes/admin/newsletterRoutes');
app.use('/api/admin/newsletters', adminNewsletterRoutes);

// Public Newsletter Routes (no authentication required - unsubscribe)
const publicNewsletterRoutes = require('./routes/publicRoutes');
app.use('/api/newsletter', publicNewsletterRoutes);

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

// 404 Handler - Must be after all routes but before error handler
const { notFoundHandler, errorHandler: globalErrorHandler } = require('./utils/errorHandler');
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

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

// Global process error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process - just log the error
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit the process - just log the error
});

