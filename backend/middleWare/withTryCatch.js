/**
 * withTryCatch Middleware - Enhanced error isolation wrapper
 *
 * Unlike asyncHandler which only catches promise rejections,
 * this middleware provides detailed logging and error context
 * for better debugging and error isolation in complex feed systems.
 *
 * Usage:
 *   router.get('/feed', withTryCatch(async (req, res) => {
 *     const data = await feedService.getAll();
 *     res.json(data);
 *   }));
 */
module.exports = (handler, contextName) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (err) {
    const context = contextName || req.originalUrl || 'unknown';
    console.error(`[withTryCatch] Error in ${context}:`, {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user?._id,
      userRole: req.user?.role
    });

    // Pass to global error handler
    next(err);
  }
};
