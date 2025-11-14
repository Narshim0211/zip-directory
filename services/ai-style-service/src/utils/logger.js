const format = (level, message, metadata = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: process.env.SERVICE_NAME || 'ai-style-service',
    message,
    ...metadata,
  };
  return JSON.stringify(payload);
};

module.exports = {
  info: (message, metadata) => console.log(format('INFO', message, metadata)),
  warn: (message, metadata) => console.warn(format('WARN', message, metadata)),
  error: (message, metadata) => console.error(format('ERROR', message, metadata)),
};
