const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");

const instance = new Razorpay({
  key_id: "rzp_test_R1NoaBRCt5uthu",
  key_secret: "FiRugZQV0KQyGwtnZPfssqFf",
});

exports.checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100), // amount in the smallest currency unit
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  res.status(200).json({
    success: true,
    order,
  });
};

exports.paymentVerification = async (req, res) => {
  console.log(req.body);
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
