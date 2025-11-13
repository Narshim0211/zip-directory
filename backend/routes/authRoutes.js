const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require("../middleWare/authMiddleware");
const authController = require("../controllers/authController");

// Register a new user
router.post("/register", authController.register);

// Login existing user
router.post("/login", authController.login);

// Get current user profile
router.get("/me", protect, authController.me);

// Password reset - request link (stubbed)
router.post('/forgot-password', authController.forgotPassword);

/**
 * Token Verification Endpoint for Microservices
 * 
 * Booking and Payment microservices use this endpoint to validate JWT tokens
 * without having their own authentication systems.
 * 
 * This maintains single sign-on (SSO) across the platform.
 */
router.post('/verify', protect, authController.verifyToken);

module.exports = router;
