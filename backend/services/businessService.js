const Business = require('../models/Business');

async function listApproved() {
  return Business.find({ status: 'approved' });
}

async function create({ ownerId, payload }) {
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

  const business = new Business({
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
  });
  return business.save();
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

