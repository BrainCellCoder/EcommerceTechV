const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderSchema");
const User = require("../models/userModel");

const instance = new Razorpay({
  key_id: "rzp_test_R1NoaBRCt5uthu",
  key_secret: "FiRugZQV0KQyGwtnZPfssqFf",
});

exports.checkout = async (req, res) => {
  try {
    console.log(req.body);
    const { amount, cart, buyer, email, address, phone } = req.body;
    const option = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(option);
    console.log(order);
    const products = cart.map((c) => {
      return { productId: c.productId, quantity: c.quantity };
    });
    console.log(products);
    await Order.deleteMany({});
    const newOrder = await Order.create({
      products,
      buyer,
      amount: amount,
      razorpay_order_id: order.id,
      email,
      address,
      phone,
    });
    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error",
      err,
    });
  }
};

exports.paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "FiRugZQV0KQyGwtnZPfssqFf")
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if (isAuthentic) {
    // DAtabase
    await Payment.deleteMany({});
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    const updateOrder = await Order.findOneAndUpdate(
      { razorpay_order_id },
      { success: true },
      { new: true }
    );
    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );
    // res.status(200).json({
    //   success: true,
    //   razorpay_payment_id,
    //   message: "Payment Successfull",
    // });
  } else {
    res.status(400).json({
      success: false,
    });
  }
};
