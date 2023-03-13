const User = require("./models/userModel");
const Admin = require("./models/adminModel");

// isLoggedIn middleware
exports.isLoggedIn = async (req, res, next) => {
  // if(!req.session.user){
  //     return res.status(400).json({
  //         message: "You must be logged in"
  //     })
  // }
  return res.status(400).json({
    success: false,
    message: "You are not Logged In",
  });
  next();
};
// isAdmin middleware
exports.isAdmin = async (req, res, next) => {
  if (req.user) {
    return res.status(400).json({
      success: false,
      message: "You are not an Admin (Access Denied)",
    });
  }
  next();
};
