const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

router.get("/login/success", async (req, res) => {
  const user = req.user;
  const token = user[0];
  const userId = user[1];
  if (req.user) {
    res
      .status(200)
      .cookie("token", token)
      .cookie("userId", userId)
      .redirect("http://localhost:3000/");
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("http://localhost:3000/");
});

router.get("/login/faliure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Fail to login",
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:8000/auth/login/success",
    failureRedirect: "login/faliure",
  })
);
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const token = req.user.token;
//     res.redirect(`http://localhost:3000/login?token=${token}`); // return the JWT token in the query parameters
//   }
// );

module.exports = router;
