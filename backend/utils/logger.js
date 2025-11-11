const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  if (typeof message === 'string') {
    return `[${timestamp}] [${level}] ${message}`;
  }
  return `[${timestamp}] [${level}] ${JSON.stringify(message)}`;
};

module.exports = {
  info: (message) => console.log(formatMessage('INFO', message)),
  warn: (message) => console.warn(formatMessage('WARN', message)),
  error: (message) => console.error(formatMessage('ERROR', message)),
};
