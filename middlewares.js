const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Admin = require("./models/adminModel");

// isLoggedIn middleware
exports.isLoggedIn = async (req, res, next) => {
  // if(!req.session.user){
  //     return res.status(400).json({
  //         message: "You must be logged in"
  //     })
  // }
  const { token } = req.cookies;
  if (token === "j:null" || token === undefined) {
    return res.status(400).json({
      success: false,
      message: "You are not Logged In",
    });
  }

  const userData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(userData.id);
  req.admin = await Admin.findById(userData.id);
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
