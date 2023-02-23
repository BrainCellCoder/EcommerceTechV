const express = require('express');
const { isLoggedIn, isAdmin } = require('../middlewares');
const adminController = require('./../controllers/adminController');
const router = express.Router();

router.route('/product/new').post(adminController.createProduct);
router.route("/product/:id").put(adminController.updateProduct).delete(adminController.deleteProduct);

router.route("/users").get(adminController.allUsers)
router.route("/user/:id").get(adminController.singleUser).delete(adminController.deleteUser);
module.exports = router;