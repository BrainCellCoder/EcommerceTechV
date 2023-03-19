const User = require("./../models/userModel");
const Product = require("./../models/productModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the credentials",
      });
    }
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashPassword = bcrypt.hashSync(password, saltRounds);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      avtaar: {
        public_id: "this is a sample id",
        url: "profileURL",
      },
    });
    res.status(200).json({
      success: true,
      message: "Registered Successfully and Loggged in!!",
      user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error!!",
      err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please register yourself",
      });
    } else {
      const hashPasssword = user.password;
      if (bcrypt.compareSync(password, hashPasssword)) {
        const token = user.getJWTToken();
        res.status(200).cookie("token", token).json({
          success: true,
          message: "Logged in successfully",
          token,
          user,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Incorrect Email/Password",
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error!!",
      error: err,
    });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.userData.id).populate("cart wishList");
    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (err) {
    res.status(400).json({
      message: "Fetching user details failed",
      error: err,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userData.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }).select("-password");
    res.status(200).json({
      message: "Updated user details",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: "Updation failed",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({
        success: true,
        message: "Product not found",
      });
    }
    const user = await User.findById(req.userData.id).select("-password");
    if (user.cart.includes(product._id)) {
      return res.json({
        success: true,
        message: "Item is already in cart",
      });
    }
    user.cart.push(product);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Product added to cart",
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

exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.userData.id;
    const user = await User.findById(userId);
    const productInCart = user.cart.includes(productId);
    if (!productInCart) {
      return res.json({
        message: "This product is not in the cart",
      });
    }
    await User.findByIdAndUpdate(userId, { $pull: { cart: productId } });
    return res.json({
      message: "Successfully removed from cart",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error",
      err,
    });
  }
};

exports.addToWishList = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({
        success: true,
        message: "Product not found",
      });
    }
    const user = await User.findById(req.userData.id).select("-password");
    if (user.wishList.includes(product._id)) {
      return res.json({
        success: true,
        message: "Item is already in Wish list",
      });
    }
    user.wishList.push(product);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Product added to Wish List",
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

exports.removeFromWishList = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.userData.id;
    const user = await User.findById(userId);
    const productInWishlist = user.wishList.includes(productId);
    if (!productInWishlist) {
      return res.json({
        message: "This product is not in the Wish List",
      });
    }
    await User.findByIdAndUpdate(userId, { $pull: { wishList: productId } });
    return res.json({
      message: "Successfully removed from Wish List",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error",
      err,
    });
  }
};
