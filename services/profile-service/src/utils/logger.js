const formatMessage = (level, message, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const service = process.env.SERVICE_NAME || 'profile-service';
  
  if (typeof message === 'string') {
    return JSON.stringify({
      timestamp,
      level,
      service,
      message,
      ...metadata,
    });
  }
  
  return JSON.stringify({
    timestamp,
    level,
    service,
    data: message,
    ...metadata,
  });
};

/**
 * Structured Logger for Profile Service
 * Per PRD Section 10: Error Isolation Rules
 */
module.exports = {
  info: (message, metadata) => console.log(formatMessage('INFO', message, metadata)),
  warn: (message, metadata) => console.warn(formatMessage('WARN', message, metadata)),
  error: (message, metadata) => console.error(formatMessage('ERROR', message, metadata)),
  debug: (message, metadata) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', message, metadata));
    }
  },
};
