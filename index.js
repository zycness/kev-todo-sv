const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);
app.use("/", (res) => {
  res.status(200).json({ status: "success" });
  console.log("success");
});
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_ACCESS_URL)
  .then(() => {
    console.log(`Connected to MongoDB...`);
    app.listen(PORT, () => {
      console.log(`Listening to server port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
