const User = require("../models/userModel");

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userData.id).select("-password");
    user.shippingAddress.push(req.body);
    await user.save();
    res.status(200).json({
      success: true,
      message: "adress",
      user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error",
      err,
    });
  }
};
