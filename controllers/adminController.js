const Product = require("./../models/productModel");
const User = require("./../models/userModel");

exports.createProduct = async (req, res) => {
  try {
    console.log("Created BY 1234");
    req.body.createdBy = req.session.user._id;
    const product = await Product.create(req.body);
    if (product) {
      return res.status(200).json({
        message: "Product created",
        product,
      });
    } else {
      return res.status(400).json({
        message: "Faild to create a product",
      });
    }
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    if (!product) {
      return res.status(400).json({
        message: "Product not found",
      });
    }
    return res.status(200).json({
      message: "Product updated",
      product,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error",
      err,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Product deleted",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

exports.allUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      message: "All users",
      numberOfUSers: users.length,
      users,
    });
  } catch (error) {
    res.status(400).json({
      messsage: "Error",
      error: err,
    });
  }
};

exports.singleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "Single user details",
      user,
    });
  } catch (error) {
    res.status(400).json({
      messsage: "Error",
      error: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(400).json({
          message: "User doesn't exists",
        });
      }
      res.status(200).json({
        message: "User Deleted",
      });
    } catch (error) {
      res.status(400).json({
        message: "Error!!",
        error: err,
      });
    }
  }
};
