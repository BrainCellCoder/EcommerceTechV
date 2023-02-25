const express = require("express");
const app = express();
const session = require("express-session");
const { isLoggedIn, isAdmin } = require("./middlewares");
const productRouter = require("./routes/productRoutes");
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
// express-session
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionOptions));
app.use(express.json());

//Routes------------------------------------------------------------------------
app.use("/products", productRouter);
app.use("/admin", isLoggedIn, isAdmin, adminRouter);
app.use("/user", userRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "PAGE NOT FOUND!!!",
  });
});

module.exports = app;
