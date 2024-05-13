const fs = require("fs");
const https = require("https");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const keratonWebsiteRouter = require("./routes/Website Keraton/controller/index");
const keratonPosRouter = require("./routes/Keraton PoS/controller/index");
const { error } = require("console");
const { success } = require("./routes/utils/response");

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTION",
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));

dotenv.config();
const port = process.env.PORT || 3031;

app.get("/ping", async (req, res) => {
  try {
    return success(res, "Pinging...", { data: "Pong" });
  } catch (err) {
    console.log(err);
    return error(res, err.message);
  }
});

app.use("/keraton", keratonWebsiteRouter);
app.use("/keraton-pos", keratonPosRouter);
app.use("/uploads", express.static("./public/assets/uploads"));

// Start server
app.listen(port, () => {
  console.log(`Server Runing on port ${port}`);
});

module.exports = app;
