const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const logger = require('morgan')
const fs = require("fs");
const http = require("https");

// const dashboardRouter = require('./routes/dashboard')
// const addRouter = require('./routes/add')
// const editRouter = require('./routes/edit')
// const invoiceRouter = require('./routes/invoice')
// const reportRouter = require('./routes/report')
// const checkoutRouter = require('./routes/checkout')
const keratonWebsiteRouter = require('./routes/Website Keraton/controller/index')
const keratonPosRouter = require('./routes/Keraton PoS/controller/index')
const { error } = require('console')
const { success } = require('./routes/utils/response')

const app = express()
const port = process.env.PORT || 3031;

//? INITIALIZE DEVELOPMENT SERVER
const httpsServer = http.createServer(app)

//? INITIALIZE PRODUCTION SERVER
// SSL configuration DISABLE ATAU BERI KOMEN JIKA DI LOCAL !
// const privateKey = fs.readFileSync("./certs/prmn.key", "utf8");
// const certificate = fs.readFileSync("./certs/prmn.crt", "utf8");
// const credentials = { key: privateKey, cert: certificate };
// const httpsServer = http.createServer(credentials, app);


//? CORS SECTION START
const allowedOrigins = [
  "http://localhost:9000", //Development

];
const corsOptions = {
  origin: function (origin, callback) {
    if(origin){
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }else callback(null, true)
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTION",
  credentials: true,
};

const io = require('socket.io')(
  httpsServer //?DEVELOPMENT SERVER
  ,
  {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  }
)


io.on('connection', async (socket) => {
  console.log(socket.id + 'User connected')
  socket.on('dashboard', () => {
    console.log('Dashboard called')
    io.emit('dashboard')
  })
  socket.on('disconnect', () => {
    console.log('User disconnected')
  })

})

//? COMMON MIDDLEWARES
app.use(logger('dev'))
app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors(corsOptions))

app.get('/ping', async (req, res) => {
  try{
    return success(res, 'Pinging...', { data: "Pong" })
  }catch(err){
    console.log(err)
    return error(res, err.message)
  }
})

//? ROUTES
app.use('/keraton', keratonWebsiteRouter)
app.use('/keraton-pos', keratonPosRouter)
app.use('/uploads', express.static('./public/assets/uploads'));


//? RUN DEVELOPMENT SERVER
httpsServer.listen(port, () => {
  console.log(`HTTPS Server running on port ${port}`);
});

module.exports = app
