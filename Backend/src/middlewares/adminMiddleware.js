const { errorResponse } = require("../utils/response");

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, "Unauthorized", 401);
  }

  if (req.user.role !== "admin") {
    return errorResponse(res, "Access denied. Admin only.", 403);
  }

  next();
};

module.exports = adminMiddleware;