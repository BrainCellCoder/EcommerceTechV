const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./../middlewares");
const reviewContaoller = require("./../controllers/reviewController");

router.route("/:id/new").post(isLoggedIn, reviewContaoller.addReview);

module.exports = router;
