const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protectVisitor = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user || user.role !== "visitor") {
        return res.status(403).json({ message: "Visitor access required" });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no visitor token" });
};

module.exports = protectVisitor;
