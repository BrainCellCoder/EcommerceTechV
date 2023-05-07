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
  .put(isLoggedIn, userController.update)
  .post(isLoggedIn, userController.addAddress);

router.route("/me/delete-address/:id").put(userController.deleteAddress);
router.route("/me/myorders").post(userController.myorders);

router
  .route("/cart/:id")
  .post(isLoggedIn, userController.addToCart)
  .delete(isLoggedIn, userController.removeFromCart)
  .patch(isLoggedIn, userController.updateCartQuantity);
router
  .route("/wishlist/:id")
  .post(isLoggedIn, userController.addToWishList)
  .delete(isLoggedIn, userController.removeFromWishList);

module.exports = router;
