const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLenght: [30, "Cannot exceed 30 characters"],
      minLength: [4, "Name should have mode than 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      // required: [true, "Please Enter your password"],
      minLength: [8, "Password should be greater than 8 characters"],
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phoneNo: {
      type: Number,
    },
    google_ID: {
      type: String,
    },
    shippingAddress: [
      {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pinCode: { type: Number },
        phoneNo: { type: Number },
      },
    ],
    avtaar: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          min: 1,
          max: 5,
          default: 1,
        },
      },
    ],
    totalCartAmount: {
      type: Number,
      default: 0,
    },
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    myOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },

  { timestamps: true }
);

userSchema.plugin(uniqueValidator, {
  message: "{PATH} already exists. Try different email",
});

// JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "jwtsecret", {
    expiresIn: process.env.JWT_EXPIRE || "10h",
  });
};

module.exports = mongoose.model("User", userSchema);
