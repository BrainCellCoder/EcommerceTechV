const Order = require("./../models/orderSchema");
const User = require("./../models/userModel");

exports.newOrder = async (req, res) => {
  try {
    const { orderedProducts, totalAmount } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (
      !user.address ||
      !user.country ||
      !user.state ||
      !user.city ||
      !user.pinCode ||
      !user.phoneNo
    ) {
      return res.json({
        status: false,
        message: "Please provide your Shipping Details before placing order",
      });
    }

    const order = await Order.create({
      user: userId,
      orderedProducts,
      totalAmount,
    });
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    res.status(200).json({
      message: "Order created",
      order,
    });
  } catch (err) {
    res.status(400).json({
      message: "Faild to create order",
      error: err,
    });
  }
};
