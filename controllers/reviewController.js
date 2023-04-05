const Product = require("./../models/productModel");
const Review = require("../models/reviewModel");

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate({
      path: "reviews",
      populate: {
        path: "author",
        model: "User",
      },
    });
    const review = new Review(req.body);
    review.author = req.userData.id;
    product.reviews.push(review);

    product.numOfReviews = product.reviews.length;

    let totalNumReviews = 0;
    Number(product.reviews.forEach((rev) => (totalNumReviews += rev.rating)));
    product.rating = Math.round(totalNumReviews / product.reviews.length);

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
