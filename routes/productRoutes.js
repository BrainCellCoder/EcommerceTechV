const express = require("express");
const productController = require("./../controllers/productController");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("./../middlewares");

router.route("/").get(productController.getAllProducts);
router.route("/:id").get(productController.getSingleProduct);

module.exports = router;
