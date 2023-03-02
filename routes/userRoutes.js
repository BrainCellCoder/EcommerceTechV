const express = require("express");
const userController = require("./../controllers/userController");
const { isLoggedIn } = require("./../middlewares");

const router = express.Router();

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/logout").post(userController.logout);

router
  .route("/me")
  .get(isLoggedIn, userController.profile)
  .put(isLoggedIn, userController.update);

router
  .route("/cart/:id")
  .post(isLoggedIn, userController.addToCart)
  .delete(isLoggedIn, userController.removeFromCart);
router
  .route("/wishlist/:id")
  .post(isLoggedIn, userController.addToWishList)
  .delete(isLoggedIn, userController.removeFromWishList);

module.exports = router;
