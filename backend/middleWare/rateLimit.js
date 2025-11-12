/**
 * Simple in-memory rate limiter middleware.
 * NOTE: In production use a distributed store (Redis) to avoid per-process limits.
 */
module.exports = function rateLimit(opts = {}) {
  const windowMs = opts.windowMs || 60 * 1000; // 1 minute
  const max = opts.max || 60; // max requests per window
  const hits = new Map();

  return (req, res, next) => {
    try {
      const key = (req.ip || req.connection.remoteAddress || 'unknown') + '|' + (opts.key || req.originalUrl || req.path);
      const now = Date.now();
      const entry = hits.get(key) || { count: 0, reset: now + windowMs };
      if (now > entry.reset) {
        entry.count = 0;
        entry.reset = now + windowMs;
      }
      entry.count += 1;
      hits.set(key, entry);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.reset / 1000));
      if (entry.count > max) {
        return res.status(429).json({ message: 'Too many requests, slow down' });
      }
      return next();
    } catch (e) {
      return next();
    }
  };
};
