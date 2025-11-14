const subscriptionMiddleware = (req, res, next) => {
  const user = req.user;
  if (!user || user.subscriptionStatus !== "active") {
    return res.status(403).json({
      success: false,
      code: "SUBSCRIPTION_REQUIRED",
      message: "An active subscription is required to access this tool.",
    });
  }
  next();
};

module.exports = subscriptionMiddleware;
