/**
 * Structured Logger for Booking Service
 * Per PRD Section 9: Error Handling & Logging
 */

const logger = {
  info: (message, metadata = {}) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'booking-service',
        message,
        ...metadata,
      })
    );
  },

  error: (message, metadata = {}) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        service: 'booking-service',
        message,
        ...metadata,
      })
    );
  },

  warn: (message, metadata = {}) => {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        service: 'booking-service',
        message,
        ...metadata,
      })
    );
  },

  debug: (message, metadata = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'DEBUG',
          service: 'booking-service',
          message,
          ...metadata,
        })
      );
    }
  },
};

module.exports = logger;
