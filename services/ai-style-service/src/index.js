const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { env } = require('./config/env');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const hairRoutes = require('./routes/hairRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const qaRoutes = require('./routes/qaRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedCallers,
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(
  morgan('dev', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

mongoose
  .connect(env.mongoUri)
  .then(() =>
    logger.info('AI Style Service connected to MongoDB', {
      database: mongoose.connection.name,
    })
  )
  .catch((err) => {
    logger.error('Mongo connection error', { message: err.message });
    process.exit(1);
  });

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: env.serviceName,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/ai', hairRoutes);
app.use('/api/ai', outfitRoutes);
app.use('/api/ai', qaRoutes);
app.use('/api/ai', profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  logger.info(`AI Style Service running on port ${env.port}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(() => process.exit(0));
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message });
  process.exit(1);
});
