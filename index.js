const express = require("express");
const app = express();
const productRouter = require("./routes/productRoutes");
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const passportSetup = require("./passport");
const authRoutes = require("./routes/authRoutes");
const cookieSession = require("cookie-session");
const cors = require("cors");
const fileUpload = require("express-fileupload");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
// app.use(bodyParser.json({ limit: "10mb" }));

// app.use(fileUpload());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["abhi"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
app.use("/auth", authRoutes);
app.use("/products", productRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
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
