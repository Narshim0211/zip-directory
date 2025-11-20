const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // ✅ Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token
      req.user = await User.findById(decoded.id).select("-password");

      return next(); // move to next middleware or route
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ✅ Optional: Role-based access check
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};

const visitorOnly = (req, res, next) => {
  if (req.user && req.user.role === "visitor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Visitors only" });
  }
};

const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === "owner") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Business owners only" });
  }
};

// ✅ Optional authentication - tries to authenticate but doesn't fail if no token
const authenticateOptional = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Token is invalid, but we don't fail - just continue without user
      console.log('Optional auth failed:', error.message);
    }
  }

  // Continue regardless of whether authentication succeeded
  next();
};

module.exports = { protect, adminOnly, visitorOnly, ownerOnly, authenticateOptional };
