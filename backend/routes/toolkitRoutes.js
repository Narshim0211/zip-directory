const express = require("express");
const protectVisitor = require("../middleWare/authVisitorMiddleware");
const toolkitController = require("../controllers/toolkitController");

const router = express.Router();

router.get(
  "/subscription",
  protectVisitor,
  toolkitController.getSubscription
);

router.post(
  "/subscription/activate",
  protectVisitor,
  toolkitController.activateSubscription
);

router.post(
  "/subscription/checkout",
  protectVisitor,
  toolkitController.createCheckoutSession
);

module.exports = router;
