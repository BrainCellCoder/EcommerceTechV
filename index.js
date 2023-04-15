const express = require("express");
const app = express();
const productRouter = require("./routes/productRoutes");
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
const orderRouter = require("./routes/orderRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middleware to advoid CORS error
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//Routes------------------------------------------------------------------------
app.use("/products", productRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/", orderRouter);
app.use("/review", reviewRouter);
app.use("/payment", paymentRouter);

app.get("/getkey", (req, res) => {
  res.status(200).json({
    key: "rzp_test_R1NoaBRCt5uthu",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({
    message: "PAGE NOT FOUND!!!",
  });
});

module.exports = app;
