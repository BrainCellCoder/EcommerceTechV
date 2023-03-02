const express = require("express");
const adminController = require("./../controllers/adminController");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("./../middlewares");

router
  .route("/product/new")
  .post(isLoggedIn, isAdmin, adminController.createProduct);
router
  .route("/product/:id")
  .put(isLoggedIn, isAdmin, adminController.updateProduct)
  .delete(adminController.deleteProduct);

router.route("/users").get(isLoggedIn, isAdmin, adminController.allUsers);
router
  .route("/user/:id")
  .get(isLoggedIn, isAdmin, adminController.singleUser)
  .delete(adminController.deleteUser);

router.route("/login").post(adminController.adminLogin);
module.exports = router;
