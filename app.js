var express = require("express");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var http = require("http");

const keratonWebsiteRouter = require("./routes/Website Keraton/controller/index");
const keratonPosRouter = require("./routes/Keraton PoS/controller/index");
const { error } = require("console");
const { success } = require("./routes/utils/response");

var app = express();
var port = normalizePort(process.env.PORT || "3000");

//? INITIALIZE DEVELOPMENT SERVER
const server = http.createServer(app);

//? CORS SECTION START
const allowedOrigins = [
  "http://localhost:9000", //Development
  "http://localhost:5173", // POS Development
];
const corsOptions = {
  origin: function (origin, callback) {
    if (origin) {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    } else callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTION",
  credentials: true,
};
//? CORS SECTION END

//? SOCKET INTIALIZATION
const io = require("socket.io")(
  server, //?DEVELOPMENT SERVER
  {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  }
);

io.on("connection", async (socket) => {
  console.log(socket.id + "User connected");
  socket.on("dashboard", () => {
    console.log("Dashboard called");
    io.emit("dashboard");
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//? COMMON MIDDLEWARES
app.use(logger("dev"));
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

//? ROUTES
app.use("/keraton", keratonWebsiteRouter);
app.use("/keraton-pos", keratonPosRouter);
app.use("/uploads", express.static("./public/uploads"));
app.use("/qrcodes", express.static("./public/qrcodes"));

//? RUN DEVELOPMENT SERVER
server.listen(port, (err) => {
  console.log(`🚀 Server ready at: http://localhost:${port}`);
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

module.exports = app;
