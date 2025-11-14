const Stripe = require("stripe");
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const priceId = process.env.TOOLKIT_SUBSCRIPTION_PRICE_ID;

const getSubscription = (req, res) => {
  const { subscriptionStatus = "inactive", subscriptionPlan = "free" } = req.user || {};
  res.json({
    success: true,
    subscriptionStatus,
    subscriptionPlan,
  });
};

const activateSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }
    req.user.subscriptionStatus = "active";
    req.user.subscriptionPlan = "premium";
    req.user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await req.user.save();
    res.json({
      success: true,
      subscriptionStatus: req.user.subscriptionStatus,
      subscriptionPlan: req.user.subscriptionPlan,
    });
  } catch (error) {
    next(error);
  }
};

const createCheckoutSession = async (req, res, next) => {
  if (!stripe || !priceId) {
    return res.status(501).json({
      success: false,
      message: "Stripe checkout is not configured.",
    });
  }

  try {
    const successUrl =
      process.env.TOOLKIT_SUCCESS_URL ||
      `${process.env.WEB_ORIGIN || "http://localhost:3000"}/visitor/toolkit`;
    const cancelUrl =
      process.env.TOOLKIT_CANCEL_URL ||
      `${process.env.WEB_ORIGIN || "http://localhost:3000"}/visitor/toolkit`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: req.user?.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        toolkitUserId: req.user?._id?.toString(),
      },
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscription,
  activateSubscription,
  createCheckoutSession,
};
