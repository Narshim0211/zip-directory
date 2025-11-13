const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const profileRoutes = require('./routes/profileRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 6001;

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
app.use(express.json({ limit: '10mb' }));
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
app.use('/api/profiles', profileRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'profile-service',
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
  logger.info(`Profile Service running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    mainBackendUrl: process.env.MAIN_BACKEND_URL,
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
