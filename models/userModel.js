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
      required: [true, "Please Enter your password"],
      minLength: [8, "Password should be greater than 8 characters"],
    },
    avtaar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    address: [
      {
        country: String,
        state: String,
        city: String,
        pinCode: Number,
        phoneNo: Number,
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
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", userSchema);
