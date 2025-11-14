const express = require("express");
const { stripeWebhook } = require("../controllers/stripeWebhookController");

const router = express.Router();

const stripeRaw = express.raw({ type: "application/json" });

// Stripe requires raw body for signature verification
router.post("/stripe", stripeRaw, (req, res, next) => {
  req.rawBody = req.body;
  next();
}, stripeWebhook);

module.exports = router;
