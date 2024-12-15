const Product = require("./../models/productModel");
const User = require("./../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Order = require("./../models/orderSchema");

exports.register = async (req, res) => {
  try {
    const { name, email, password, cPassword } = req.body;
    if (!name || !email || !password || !cPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the credentials",
      });
    }
    if (password !== cPassword) {
      return res.status(400).json({
        success: false,
        message: "Password Mismatched",
      });
    }
    const saltRounds = Number(process.env.SALT_ROUNDS || 10);
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
    console.log(user);
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
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Error!!",
      error: err,
    });
  }
};

exports.logout = (req, res) => {
  res
    .status(200)
    .cookie("token", "", { expires: new Date(0) })
    .json({
      success: true,
      message: "Logged Out",
    });
};

exports.profile = async (req, res) => {
  try {
    const { id } = req.userData;
    const user = await User.findById({ _id: id }).populate(
      "cart.productId wishList"
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User details not found",
      });
    }
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

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.body.addressId;
    const userId = req.body.userId;
    await User.findByIdAndUpdate(userId, {
      $pull: { shippingAddress: { _id: addressId } },
    });
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      err,
      message: "Deletion failed",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userData.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({
        success: true,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.userData.id).populate(
      "cart.productId wishList"
    );
    const itemExists = user.cart.find((item) =>
      item.productId.equals(product._id)
    );
    if (itemExists) {
      return res.json({
        success: true,
        message: "Item is already in cart",
      });
    }
    user.cart.push(req.body);
    if (user.wishList.includes(id)) {
      await User.findByIdAndUpdate(userId, { $pull: { wishList: id } });
    }
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
    // const productInCart = user.cart.includes(productId);
    const itemExists = user.cart.find((item) =>
      item.productId.equals(productId)
    );
    if (!itemExists) {
      return res.json({
        message: "This product is not in the cart",
      });
    }
    await User.findByIdAndUpdate(userId, { $pull: { cart: { productId } } });
    return res.json({
      success: true,
      message: "Successfully removed from cart",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error",
      err,
    });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user = await User.findById(req.userData.id).populate(
      "cart.productId wishList"
    );
    const itemIndex = user.cart.findIndex(
      (item) => item.productId._id.toString() === id
    );
    if (itemIndex !== -1) {
      user.cart[itemIndex].quantity = quantity;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Product quantity updated",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Product not found in the cart",
      });
    }
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
      success: true,
      message: "Successfully removed from Wish List",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error",
      err,
    });
  }
};

exports.myorders = async (req, res) => {
  try {
    const buyerId = req.body.id;
    const orders = await Order.find({
      buyer: buyerId,
    }).populate("products.productId");
    if (!orders) {
      return res.status(400).json({
        success: false,
        message: "No orders found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Orders found",
      orders,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error",
      err,
    });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userData.id).select("-password");
    user.shippingAddress.push(req.body);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Address Saved",
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
