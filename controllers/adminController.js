const Product = require("./../models/productModel");
const Admin = require("./../models/adminModel");
const User = require("./../models/userModel");

const { cloudinary } = require("./../cloudinary");

exports.adminLogin = async (req, res) => {
  // try {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter email and password",
    });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({
      message: "Admin not found.",
    });
  } else {
    if (password === admin.password) {
      // req.session.user = admin;
      const token = admin.getJWTToken();
      res.status(200).cookie("token", token).json({
        success: true,
        message: "Loggged in!!",
        admin,
        token,
      });
    } else {
      res.status(400).json({
        message: "Incorrect Username/Password",
      });
    }
  }
  // } catch (err) {
  //   res.status(400).json({
  //     message: "Error!!",
  //     error: err,
  //   });
  // }
};

exports.createProduct = async (req, res) => {
  try {
    req.body.createdBy = req.admin._id;
    const product = await Product(req.body);
    const file = req.file;
    // product.images = files.map((f) => ({ url: f.path, filename: f.filename }));
    product.image = { url: file.path, filename: file.filename };
    await product.save();
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
    const product = await Product.findById(req.params.id);
    console.log(product);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }
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
  } catch (err) {
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
