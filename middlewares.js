const User = require("./models/userModel");
const Admin = require("./models/adminModel");
const jwt = require("jsonwebtoken");

// isLoggedIn middleware
exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    console.log(req.userData);
    console.log(decoded);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Auth failed" });
  }
};
// isAdmin middleware
exports.isAdmin = async (req, res, next) => {
  const adminId = "640015af1cfb19ee650595cc";
  const loginUserId = req.userData.id;
  if (adminId !== loginUserId) {
    return res.status(400).json({
      success: false,
      message: "You are not an Admin (Access Denied)",
    });
  }
  next();
};
