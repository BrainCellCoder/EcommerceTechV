const mongoose = require("mongoose");
const validator = require("validator");
const uniqueValidator = require("mongoose-unique-validator");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter your password"],
    minLength: [8, "Password should be greater than 8 characters"],
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
});
adminSchema.plugin(uniqueValidator, {
  message: "{PATH} already exists. Try different email",
});

module.exports = mongoose.model("Admin", adminSchema);
