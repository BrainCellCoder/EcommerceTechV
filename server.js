const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
require("dotenv").config({ path: "./.env" });
const app = require("./index");
const Razorpay = require("razorpay");

// export const instance = new Razorpay({
//   key_id: "rzp_test_R1NoaBRCt5uthu",
//   key_secret: "FiRugZQV0KQyGwtnZPfssqFf",
// });

const DB = process.env.DB_URL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connected successfully");
  })
  .catch((e) => {
    console.log(e);
  });

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
