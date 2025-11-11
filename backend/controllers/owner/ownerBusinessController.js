const ownerBusinessService = require("../../services/owner/ownerBusinessService");

const getBusiness = async (req, res) => {
  const business = await ownerBusinessService.findBusinessByOwner(req.user._id);
  res.json(business || null);
};

const upsertBusiness = async (req, res) => {
  const updated = await ownerBusinessService.upsertBusiness(req.user._id, req.body || {});
  res.json(updated);
};

module.exports = { getBusiness, upsertBusiness };
