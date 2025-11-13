const express = require('express');
const axios = require('axios');
const { protect } = require('../middleWare/authMiddleware');

const router = express.Router();
const PROFILE_SERVICE_URL = process.env.PROFILE_SERVICE_URL || 'http://localhost:6001';

router.use(protect, async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace('/api/profiles-service', '/api/profiles');
    const targetUrl = PROFILE_SERVICE_URL + targetPath;
    
    // Forward only necessary headers
    const forwardHeaders = {
      'authorization': req.headers.authorization,
      'content-type': req.headers['content-type'] || 'application/json',
      'accept': req.headers.accept || 'application/json'
    };
    
    const config = {
      method: req.method,
      url: targetUrl,
      headers: forwardHeaders,
      timeout: 30000
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) config.data = req.body;
    if (Object.keys(req.query).length > 0) config.params = req.query;
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Profile Proxy Error]', {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      status: error.response?.status,
      data: error.response?.data
    });
    if (error.response) res.status(error.response.status).json(error.response.data);
    else if (error.code === 'ECONNREFUSED') res.status(503).json({ success: false, message: 'Profile service unavailable' });
    else res.status(500).json({ success: false, message: 'Proxy error', details: error.message });
  }
});

module.exports = router;
