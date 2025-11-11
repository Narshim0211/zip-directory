const ownerDashboardService = require("../../services/owner/ownerDashboardService");

const getStats = async (req, res) => {
  const data = await ownerDashboardService.getDashboardStats(req.user._id);
  res.json(data);
};

module.exports = { getStats };
