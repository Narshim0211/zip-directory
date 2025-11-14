const express = require('express');
const multer = require('multer');
const protectVisitor = require('../middleWare/authVisitorMiddleware');
const controller = require('../controllers/styleAdvisorController');

const subscriptionMiddleware = require('../middleWare/subscriptionMiddleware');
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  '/hair-tryon',
  protectVisitor,
  subscriptionMiddleware,
  upload.single('photo'),
  controller.hairTryOn
);

router.post(
  '/outfit-tryon',
  protectVisitor,
  subscriptionMiddleware,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'outfit', maxCount: 1 },
  ]),
  controller.outfitTryOn
);

router.post('/qa', protectVisitor, subscriptionMiddleware, controller.askQuestion);

router.get('/profile', protectVisitor, controller.getProfile);
router.post('/profile', protectVisitor, controller.saveProfile);

module.exports = router;
