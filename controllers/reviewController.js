const Product = require("./../models/productModel");
const Review = require("../models/reviewModel");

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    const review = new Review(req.body);
    review.author = req.userData.id;
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
    await product.save();
    await review.save();
    return res.json({
      success: true,
      message: "Successfully Added a Review",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};
