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
  const { amount, quantity, productId, user } = req.body;
  const options = {
    amount: Number(amount * 100 * quantity), // amount in the smallest currency unit
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  const orderDB = await Order.create({
    orderItems: { quantity: quantity, productId: productId },
    user,
  });
  res.status(200).json({
    success: true,
    order,
  });
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
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
};
