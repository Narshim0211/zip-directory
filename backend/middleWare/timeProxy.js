const express = require('express');
const axios = require('axios');

/**
 * Minimal axios-based proxy to forward requests to the Time microservice
 * without adding an external dependency. Honors Authorization header.
 *
 * Usage:
 *   app.use('/api/visitor/time', timeProxy('/visitor/time'))
 *   app.use('/api/owner/time', timeProxy('/owner/time'))
 */
function timeProxy(prefix = '') {
  const router = express.Router();
  const baseTarget = process.env.TIME_SERVICE_URL; // e.g. http://localhost:5500/api

  if (!baseTarget) {
    // Provide a visible 501 response if service URL not configured
    router.use((req, res) => {
      res.status(501).json({
        error: 'Time service not configured',
        hint: 'Set TIME_SERVICE_URL to your time-service base (e.g., http://localhost:5500/api)',
        path: req.originalUrl,
      });
    });
    return router;
  }

  // Generic handler for all HTTP verbs
  const handler = async (req, res) => {
    const targetUrl = `${baseTarget}${prefix}${req.path}`;

    try {
      const { method, headers, query, body } = req;

      const response = await axios({
        url: targetUrl,
        method,
        headers: {
          // forward useful headers
          Authorization: headers['authorization'],
          'Content-Type': headers['content-type'] || 'application/json',
        },
        params: query,
        data: body,
        // Do not throw for non-2xx; we relay the status
        validateStatus: () => true,
        timeout: 20000,
      });

      // Relay status and data
      res.status(response.status);
      // Relay headers selectively if needed (skipped for simplicity)
      return res.send(response.data);
    } catch (err) {
    const status = err.response?.status || 502;
    if (status === 502 || err.code === 'ECONNREFUSED') {
      return res.status(200).json({
        tasks: [],
        message: 'Time service temporarily unavailable. Data will reappear once it reconnects.',
      });
    }
    const message = err.response?.data || { error: err.message || 'Proxy error' };
    return res.status(status).send(message);
  }
};

  // Catch all requests using middleware
  router.use(handler);

  return router;
}

module.exports = { timeProxy };
