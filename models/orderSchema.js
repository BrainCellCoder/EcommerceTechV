const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    require: true,
  },
  razorpay_order_id: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
  },
  success: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "Not processed",
    enum: ["Not processed", "Processing", "Shipped", "Delivered"],
  },
  // address: {
  //   type: String,
  //   // required: true,
  // },
  phone: {
    type: String,
    // required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});
module.exports = mongoose.model("Order", orderSchema);
