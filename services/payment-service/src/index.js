const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 6003;

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Body Parsers
// Note: Webhook route uses express.raw, so we apply JSON parser selectively
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('MongoDB connected successfully', {
      database: mongoose.connection.name,
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

// Routes
app.use('/api', paymentRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'payment-service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`Payment Service running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    mainBackendUrl: process.env.MAIN_BACKEND_URL,
    stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
  });
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

module.exports = app;
