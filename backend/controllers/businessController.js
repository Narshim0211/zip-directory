const catchAsync = require('../utils/catchAsync');
const businessService = require('../services/businessService');

exports.listApproved = catchAsync(async (req, res) => {
  const items = await businessService.listApproved();
  res.json(items);
});

exports.create = catchAsync(async (req, res) => {
  const saved = await businessService.create({ ownerId: req.user._id, payload: req.body || {} });
  res.status(201).json(saved);
});

exports.setStatus = catchAsync(async (req, res) => {
  const updated = await businessService.setStatus({ id: req.params.id, status: (req.body || {}).status });
  if (!updated) return res.status(404).json({ message: 'Business not found' });
  res.json(updated);
});

exports.approve = catchAsync(async (req, res) => {
  const updated = await businessService.approve(req.params.id);
  if (!updated) return res.status(404).json({ message: 'Business not found' });
  res.json(updated);
});

exports.remove = catchAsync(async (req, res) => {
  const business = await businessService.findById(req.params.id);
  if (!business) return res.status(404).json({ message: 'Business not found' });

  if (String(business.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this business' });
  }
  await businessService.removeById(req.params.id);
  res.json({ message: 'Business deleted successfully' });
});

