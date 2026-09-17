const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Check token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Token required", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user data for next middleware/controller
    req.user = decoded;
    next();

    } catch (error) {
            return errorResponse(res, "Invalid or expired token", 401);

    }
}

module.exports = authMiddleware;