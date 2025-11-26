/**
 * Comment Routes - V1 (Zero Paywall)
 * All logged-in users (Owner or Visitor) can comment/reply/delete
 * Guests can read only (no auth required)
 *
 * V2 Features Removed (will be re-added in V2):
 * - Like/Love reactions
 * - Pinning
 * - Reporting
 * - Text moderation middleware
 */

const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const controller = require('../controllers/commentsController');

// GET /api/comments?contentType=survey&contentId=123
// No auth required - guests can read comments
router.get('/', controller.getComments);

// POST /api/comments
// Auth required - all logged-in users can create comments
router.post('/', protect, controller.create);

// POST /api/comments/:id/reply
// Auth required - all logged-in users can reply
router.post('/:id/reply', protect, controller.reply);

// DELETE /api/comments/:id
// Auth required - users can delete their own comments only (enforced in controller)
router.delete('/:id', protect, controller.softDelete);

module.exports = router;
