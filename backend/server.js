const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Middleware
const cors = require('cors');

// CORS allowlist: main site + admin + local dev
const rawOrigins = [
  process.env.WEB_ORIGIN,      // e.g. https://salonhub.com
  process.env.ADMIN_ORIGIN,    // e.g. https://admin.salonhub.com
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const allowlist = new Set(rawOrigins);
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (allowlist.has(origin) || localhostRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
// Express 5 (path-to-regexp v6): use a RegExp or omit path.
// Handle preflight for all routes using a RegExp that matches anything.
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err.message));

// Health check
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'SalonHub API is working' });
});

// Routes
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const businessRoutes = require('./routes/business.Route');
app.use('/api/businesses', businessRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Dev-only: Seed an admin user if missing
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/seed-admin', async (req, res) => {
    try {
      const email = (req.body && req.body.email) || 'admin@example.com';
      const password = (req.body && req.body.password) || 'admin123';
      const name = (req.body && req.body.name) || 'Admin';

      let user = await User.findOne({ email });
      if (user) {
        const wasAdmin = user.role === 'admin';
        if (!wasAdmin) {
          user.role = 'admin';
          await user.save();
        }
        return res.json({
          seeded: false,
          updatedRole: !wasAdmin,
          id: user._id,
          email: user.email,
          role: user.role,
        });
      }

      user = new User({ name, email, password, role: 'admin' });
      await user.save();
      return res.status(201).json({
        seeded: true,
        id: user._id,
        email: user.email,
        role: user.role,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });
}


// Start server (export app for Vercel serverless)
const PORT = process.env.PORT || 5000;
if (process.env.VERCEL) {
  module.exports = app; // Vercel will handle the serverless function
} else {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Basic error handler for CORS rejections
app.use((err, req, res, next) => {
  if (err && err.message && String(err.message).startsWith('Not allowed by CORS')) {
    return res.status(403).json({ error: 'CORS: origin not allowed' });
  }
  next(err);
});
