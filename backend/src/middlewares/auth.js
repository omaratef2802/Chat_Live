const jwt = require("jsonwebtoken");
const User = require("../modules/dbUsers");
const ApiError = require("../utils/ApiError");
module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    if (!token) throw new ApiError(401, "Authentication required");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("_id email username isEmailVerified");
    if (!user) throw new ApiError(401, "Account no longer exists");
    req.user = user; next();
  } catch (error) { next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token")); }
};
