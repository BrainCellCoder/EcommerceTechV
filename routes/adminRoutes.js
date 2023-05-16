const express = require("express");
const adminController = require("./../controllers/adminController");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("./../middlewares");

const multer = require("multer");
const { storage } = require("./../cloudinary");
const upload = multer({ storage });

router
  .route("/product/new")
  .post(
    isLoggedIn,
    isAdmin,
    upload.single("file"),
    adminController.createProduct
  );
router
  .route("/product/:id")
  .put(isLoggedIn, isAdmin, adminController.updateProduct)
  .delete(isLoggedIn, isAdmin, adminController.deleteProduct);

router.route("/users").get(isLoggedIn, isAdmin, adminController.allUsers);
// router.route("/users").get(adminController.allUsers);
router
  .route("/user/:id")
  .get(isLoggedIn, isAdmin, adminController.singleUser)
  .delete(isLoggedIn, isAdmin, adminController.deleteUser);

router.route("/login").post(adminController.adminLogin);

router
  .route("/allorders")
  .get(isLoggedIn, isAdmin, adminController.getAllOrders);
router
  .route("/orderstatus/:orderId")
  .post(isLoggedIn, isAdmin, adminController.updateOrderStatus);
module.exports = router;
