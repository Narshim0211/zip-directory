/**
 * Time Management Microservice
 * Express application setup for visitor and owner time management
 * Complete separation with independent fault isolation per role
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const authMiddleware = require('./src/middleware/authMiddleware');
const errorHandler = require('./src/middleware/errorHandler');
const visitorTimeRoutes = require('./src/routes/visitor/timeRoutes');
const ownerTimeRoutes = require('./src/routes/owner/timeRoutes');
const { initializeReminderCron } = require('./src/cron/reminderCron');

// Initialize Express app
const app = express();

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/time-service';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ [Database] Connected to MongoDB: ${mongoUri}`);
  } catch (error) {
    console.error('❌ [Database] Connection failed:', error.message);
    process.exit(1);
  }
};

// Security & Parsing Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging Middleware
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  skip: (req) => req.path === '/health',
}));

// Request ID tracking for debugging
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

/**
 * HEALTH CHECK ENDPOINT
 * Used for monitoring and deployment verification
 */
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'Time Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
  });
});

/**
 * ROOT ENDPOINT
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SalonHub Time Management Microservice',
    version: '1.0.0',
    endpoints: {
      visitor: '/api/visitor/time',
      owner: '/api/owner/time',
      health: '/health',
    },
  });
});

/**
 * VISITOR TIME MANAGEMENT API
 * Path: /api/visitor/time/*
 * Auth: Visitor role only
 * Fault Isolation: Independent error handling per request
 */
app.use('/api/visitor/time', (req, res, next) => {
  // Wrap visitor routes with role-specific error handling
  req.roleContext = 'visitor';
  next();
}, visitorTimeRoutes);

/**
 * OWNER TIME MANAGEMENT API
 * Path: /api/owner/time/*
 * Auth: Owner role only
 * Fault Isolation: Independent error handling per request
 */
app.use('/api/owner/time', (req, res, next) => {
  // Wrap owner routes with role-specific error handling
  req.roleContext = 'owner';
  next();
}, ownerTimeRoutes);

/**
 * GLOBAL ERROR HANDLER
 * Catches all errors from routes and middleware
 * Provides consistent error response format
 */
app.use(errorHandler);

/**
 * 404 NOT FOUND HANDLER
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

/**
 * GRACEFUL SHUTDOWN
 * Handle server termination signals
 */
const gracefulShutdown = (signal) => {
  console.log(`\n📍 Received ${signal}, shutting down gracefully...`);
  mongoose.connection.close(false, () => {
    console.log('✅ [Database] MongoDB connection closed');
    process.exit(0);
  });
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * START SERVER
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    // Initialize cron jobs
    initializeReminderCron();

    // Start listening
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 [Server] Time Management Service running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`\n📝 Available Endpoints:`);
      console.log(`   ✓ GET  /health - Health check`);
      console.log(`   ✓ GET  /api/visitor/time/tasks - List visitor tasks`);
      console.log(`   ✓ POST /api/visitor/time/tasks - Create visitor task`);
      console.log(`   ✓ GET  /api/owner/time/tasks - List owner tasks`);
      console.log(`   ✓ POST /api/owner/time/tasks - Create owner task`);
      console.log(`\n⏸️  Press Ctrl+C to stop server\n`);
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ [Server] Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('❌ [Startup] Fatal error:', error.message);
    process.exit(1);
  }
};

// Only start if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
