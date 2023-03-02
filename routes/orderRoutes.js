const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./../middlewares");
const orderController = require("./../controllers/orderController");

router.route("/order/new").post(isLoggedIn, orderController.newOrder);

module.exports = router;
