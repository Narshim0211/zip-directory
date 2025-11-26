const asyncWrap = require('../../middleWare/asyncHandler');
const Business = require('../../models/Business');
const OwnerProfile = require('../../models/OwnerProfile');

/**
 * Business Controller (v1)
 * Handles business entities (salons, spas, shops)
 *
 * IMPORTANT: These are SEPARATE from personal owner profiles
 * - Owner Profile = The human (Nitesh Siwakoti)
 * - Business = The salon/spa (Nites Salon)
 */

/**
 * Get all businesses owned by current user
 * GET /api/v1/businesses/my-businesses
 */
exports.getMyBusinesses = asyncWrap(async (req, res) => {
  console.log('[businessController] getMyBusinesses - user:', req.user._id);

  const businesses = await Business.find({
    owner: req.user._id,
    isDeleted: false
  }).sort({ createdAt: -1 });

  console.log('[businessController] Found businesses:', businesses.length);
  res.json(businesses);
});

/**
 * Get business by ID
 * GET /api/v1/businesses/:id
 */
exports.getById = asyncWrap(async (req, res) => {
  const business = await Business.findById(req.params.id);

  if (!business || business.isDeleted) {
    return res.status(404).json({ message: 'Business not found' });
  }

  res.json(business);
});

/**
 * Create new business
 * POST /api/v1/businesses
 */
exports.create = asyncWrap(async (req, res) => {
  const { name, category, description, city, state, zip, address } = req.body;

  console.log('[businessController] create - data:', { name, category, city });

  // Validation
  if (!name || !category || !city) {
    return res.status(400).json({
      message: 'Name, category, and city are required'
    });
  }

  // Create business
  const business = await Business.create({
    owner: req.user._id,
    name,
    category,
    description: description || '',
    city,
    state: state || '',
    zip: zip || '',
    address: address || '',
    moderationStatus: 'PENDING',
    status: 'pending'
  });

  console.log('[businessController] Business created:', business._id);

  // Add to owner's featured businesses
  await OwnerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $addToSet: { featuredBusinesses: business._id } }
  );

  console.log('[businessController] Added to featured businesses');

  res.status(201).json(business);
});

/**
 * Update business
 * PUT /api/v1/businesses/:id
 */
exports.update = asyncWrap(async (req, res) => {
  const business = await Business.findById(req.params.id);

  if (!business) {
    return res.status(404).json({ message: 'Business not found' });
  }

  // Verify ownership
  if (business.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this business' });
  }

  const { name, category, description, city, state, zip, address, logoUrl, bannerUrl } = req.body;

  console.log('[businessController] update - businessId:', req.params.id, 'fields:', Object.keys(req.body));

  // Update fields
  if (name !== undefined) business.name = name;
  if (category !== undefined) business.category = category;
  if (description !== undefined) business.description = description;
  if (city !== undefined) business.city = city;
  if (state !== undefined) business.state = state;
  if (zip !== undefined) business.zip = zip;
  if (address !== undefined) business.address = address;
  if (logoUrl !== undefined) business.logoUrl = logoUrl;
  if (bannerUrl !== undefined) business.bannerUrl = bannerUrl;

  await business.save();

  console.log('[businessController] Business updated successfully');
  res.json(business);
});

/**
 * Upload business logo/banner
 * POST /api/v1/businesses/:id/upload
 */
exports.uploadImage = asyncWrap(async (req, res) => {
  const { type, base64, originalName } = req.body;

  if (!type || (type !== 'logo' && type !== 'banner')) {
    return res.status(400).json({ message: 'type must be logo or banner' });
  }

  if (!base64) {
    return res.status(400).json({ message: 'base64 payload required' });
  }

  const business = await Business.findById(req.params.id);

  if (!business) {
    return res.status(404).json({ message: 'Business not found' });
  }

  // Verify ownership
  if (business.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const galleryService = require('../../services/galleryService');

  console.log('[businessController] uploadImage - type:', type, 'businessId:', req.params.id);

  const upload = await galleryService.uploadBase64({
    base64,
    originalName: originalName || `${type}.png`,
    folder: `business-${business._id}`
  });

  // Update business
  if (type === 'logo') {
    business.logoUrl = upload.url;
  } else {
    business.bannerUrl = upload.url;
  }

  await business.save();

  console.log('[businessController] Image uploaded:', upload.url);
  res.json({ url: upload.url });
});

/**
 * Delete business (soft delete)
 * DELETE /api/v1/businesses/:id
 */
exports.delete = asyncWrap(async (req, res) => {
  const business = await Business.findById(req.params.id);

  if (!business) {
    return res.status(404).json({ message: 'Business not found' });
  }

  // Verify ownership
  if (business.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  console.log('[businessController] delete - businessId:', req.params.id);

  // Soft delete
  business.isDeleted = true;
  business.deletedAt = new Date();
  await business.save();

  // Remove from owner's featured businesses
  await OwnerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { featuredBusinesses: business._id } }
  );

  console.log('[businessController] Business deleted successfully');
  res.json({ message: 'Business deleted successfully' });
});
