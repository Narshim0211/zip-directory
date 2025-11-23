const Business = require('../models/Business');
const BusinessModerationEngine = require('../modules/moderation/businessModerationEngine');

async function listApproved() {
  // 🛡️ Filter by both legacy status AND new moderationStatus
  // Only show businesses that are fully approved
  return Business.find({
    status: 'approved',
    moderationStatus: 'APPROVED'
  });
}

async function create({ ownerId, payload, req }) {
  const { name, city, category, description, address, images, services, specialties } = payload || {};
  const errors = [];
  if (!name || !String(name).trim()) errors.push("'name' is required");
  if (!city || !String(city).trim()) errors.push("'city' is required");
  if (!category || !String(category).trim()) errors.push("'category' is required");

  const allowedCategories = Business.schema.path('category').enumValues;
  if (category && !allowedCategories.includes(category)) {
    errors.push(`'category' must be one of: ${allowedCategories.join(', ')}`);
  }
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }

  // Prepare business data
  const businessData = {
    name: name.trim(),
    city: city.trim(),
    category,
    description,
    address,
    images,
    services,
    specialties,
    owner: ownerId,
    status: 'pending',
  };

  // 🛡️ Run moderation engine on new business
  const moderation = await BusinessModerationEngine.evaluate(businessData, {
    ip: req?.ip,
    ownerId,
  });

  // Create business with moderation results
  const business = new Business({
    ...businessData,
    moderationStatus: moderation.status,
    moderationIssues: moderation.issues,
    metadata: {
      ip: req?.ip,
      lastModeratedAt: new Date(),
    },
  });

  const saved = await business.save();

  // Return business with moderation metadata for frontend
  return {
    ...saved.toObject(),
    _moderation: moderation, // Include moderation results in response
  };
}

async function setStatus({ id, status }) {
  const allowed = ['pending', 'approved', 'rejected'];
  if (!allowed.includes(status)) {
    const err = new Error(`status must be one of: ${allowed.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const updated = await Business.findByIdAndUpdate(id, { status }, { new: true });
  return updated;
}

async function approve(id) {
  return Business.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
}

async function findById(id) {
  return Business.findById(id);
}

async function removeById(id) {
  const doc = await Business.findById(id);
  if (!doc) return null;
  await doc.deleteOne();
  return true;
}

module.exports = { listApproved, create, setStatus, approve, findById, removeById };

