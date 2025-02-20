const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");
const http = require('http')
const path = require("path");

const keratonWebsiteRouter = require("./routes/Website Keraton/controller/index");
const keratonPosRouter = require("./routes/Keraton PoS/controller/index");
const paymentRouter = require('./routes/Payment/payment.controller')
const { error } = require("console");
const { success } = require("./routes/utils/response");

var app = express();
var port = normalizePort(process.env.PORT || "3000");
const server = http.createServer(app)

// const privateKey = fs.readFileSync("./certs/prmn.key", "utf8");
// const certificate = fs.readFileSync("./certs/prmn.crt", "utf8");
// const credentials = { key: privateKey, cert: certificate };
// const server = https.createServer(credentials, app);


const allowedOrigins = [
  "https://keraton.curaweda.com", //Keraton Production
  "https://pos-keraton.curaweda.com", // POS Production
  "https://kerataon-pos-dev.curaweda.com", //Keraton Development
  "https://keraton-web-dev.curaweda.com"
];
const corsOptions = {
  origin: true, // This will override the existing 'origin' function
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
};

const io = require("socket.io")(
  server, //?DEVELOPMENT SERVER
  {
    cors: {
      origin: true, // This will override the existing 'origin' function
      credentials: true,
    },
  }
);


app.set('view engine', 'ejs')

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.get("/ping", async (req, res) => {
  try {
    return success(res, "Pinging...", { data: "Pong" });
  } catch (err) {
    console.log(err);
    return error(res, err.message);
  }
});

io.on("connection", async (socket) => {
  console.log(socket.id + "User connected");
  socket.on("dashboard", () => {
    console.log("Dashboard called");
    io.emit("dashboard");
  });
  socket.on("event", () => {
    console.log('New Event Entry')
    io.emit('event')
  })
  socket.on("tiket", () => {
    console.log('New Tiket Entry')
    io.emit('tiket')
  })
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


//? ROUTES
app.use("/keraton", keratonWebsiteRouter);
app.use('/payment', paymentRouter)
app.use("/keraton-pos", keratonPosRouter);

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/qrcodes", express.static(path.join(__dirname, "public", "qrcodes")));
app.use("/pdfs", express.static(path.join(__dirname, "public", "pdfs")));
app.use("/public/assets/email/", express.static(path.join(__dirname, 'public/assets/email')));

//? RUN DEVELOPMENT SERVER
server.listen(port, (err) => {
  console.log(`ðŸš€ Server ready at: http://localhost:${port}`);
});

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

module.exports = app;
