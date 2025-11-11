const createRouter = require('./asyncRouter');
const router = createRouter();
const Review = require('../models/Review');
const Business = require('../models/Business');
const Activity = require('../models/Activity');
const { protect, adminOnly } = require('../middleWare/authMiddleware');
const notificationService = require('../services/notificationService');

const mapReview = (doc) => ({
  _id: doc._id,
  rating: doc.rating,
  text: doc.text,
  createdAt: doc.createdAt,
  status: doc.status,
  replies: doc.replies || [],
  reviewer: doc.reviewerId,
});

router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 5), 50);
    const reviews = await Review.find({ status: 'visible' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('businessId', 'name city category')
      .populate('reviewerId', 'name');
    res.json(
      reviews.map((r) => ({
        ...mapReview(r),
        business: r.businessId,
        user: r.reviewerId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/business/:businessId', async (req, res) => {
  try {
    const reviews = await Review.find({
      businessId: req.params.businessId,
      status: 'visible',
    })
      .sort({ createdAt: -1 })
      .populate('reviewerId', 'name');
    res.json(
      reviews.map((r) => ({
        ...mapReview(r),
        user: r.reviewerId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { businessId, rating, text } = req.body || {};
    if (!businessId || !rating || !text) {
      return res.status(400).json({ message: 'Business, rating, and text are required' });
    }
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    if (String(text || '').trim().length < 5) return res.status(400).json({ message: 'Review must be at least 5 characters' });
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const review = new Review({
      businessId,
      reviewerId: req.user._id,
      rating,
      text: text.trim(),
      images: req.body.images || [],
    });
    const saved = await review.save();

    notificationService.notifyUser({
      recipientId: business.owner,
      senderId: req.user._id,
      type: 'new_review',
      title: 'New review received',
      message: `${req.user.name || 'Someone'} left you a review.`,
      contentType: 'review',
      contentId: saved._id,
      link: `/business/${business._id}`,
    });

    try {
      await Activity.create({
        type: 'review',
        title: 'New review posted',
        description: `A ${saved.rating}-star review was shared.`,
        link: `/business/${business._id}`,
      });
    } catch (_) {}

    res.status(201).json(mapReview(saved));
  } catch (error) {
    const msg = error && error.code === 11000 ? 'You have already reviewed this business' : error.message;
    res.status(400).json({ message: msg });
  }
});

const ensureOwnerOrAdmin = async (req, review, business) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const isOwner = req.user && business && String(business.owner) === String(req.user._id);
  return isAdmin || isOwner;
};

router.post('/:reviewId/reply', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const business = await Business.findById(review.businessId);
    if (!await ensureOwnerOrAdmin(req, review, business)) return res.status(403).json({ message: 'Not authorized' });
    const message = (req.body.text || '').trim();
    if (!message) return res.status(400).json({ message: 'Reply text is required' });
    review.replies.push({ author: req.user._id, message });
    await review.save();

    notificationService.notifyUser({
      recipientId: review.reviewerId,
      senderId: req.user._id,
      type: 'review_reply',
      title: 'Owner replied to your review',
      message: `${business.name} owner replied.`,
      contentType: 'review',
      contentId: review._id,
      link: `/business/${business._id}`,
    });

    res.json({ ok: true, replies: review.replies });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:reviewId/request-removal', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const business = await Business.findById(review.businessId);
    if (!await ensureOwnerOrAdmin(req, review, business)) return res.status(403).json({ message: 'Not authorized' });
    review.isPendingRemoval = true;
    review.removalRequestMessage = (req.body.message || '').trim();
    await review.save();
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:reviewId/flag', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.isFlagged = true;
    review.flaggedBy = req.user._id;
    review.flagReason = (req.body.reason || '').trim();
    await review.save();
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find({ $or: [{ isFlagged: true }, { isPendingRemoval: true }] })
      .sort({ updatedAt: -1 })
      .populate('businessId', 'name')
      .populate('reviewerId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:reviewId', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
