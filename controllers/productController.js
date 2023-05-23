const Product = require("./../models/productModel");

exports.getAllProducts = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const { name, category, price } = req.query;
    const queryObj = {};
    if (name) {
      queryObj.name = { $regex: name, $options: "i" }; //filter by name
    }
    if (category) {
      queryObj.category = { $regex: category, $options: "i" }; //filter by category
    }
    if (price) {
      let p = JSON.stringify(price);
      p = p.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
      queryObj.price = JSON.parse(p); //filter by price
    }
    //pagination
    // let page = Number(req.query.page) || 1;
    // let limit = Number(req.query.limit) || 3;//result per page
    // let skip = (page-1)*limit;
    // const products = await Product.find(queryObj).skip(skip).limit(limit);

    const products = await Product.find(queryObj).populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });
    res.status(200).json({
      numberOfProduct: products.length,
      products: products.length === 0 ? "No product found" : products,
      totalNumberOfProducts: productCount,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    console.log("searxh");
    const { text } = req.query;
    console.log(text);
    const product = await Product.find({
      $or: [
        { name: { $regex: new RegExp(text, "i") } },
        // { description: { $regex: new RegExp(text, "i") } },
        { category: { $regex: new RegExp(text, "i") } },
      ],
    });
    console.log(product);
    res.status(200).json({
      totalProducts: product.length,
      products: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err,
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate({
      path: "reviews",
      populate: {
        path: "author",
        model: "User",
      },
    });
    if (product) {
      return res.status(200).json({
        message: "Product details found",
        product,
      });
    } else {
      return res.status(400).json({
        message: "Product not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};
