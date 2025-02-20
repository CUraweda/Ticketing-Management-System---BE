var express = require("express");
var router = express.Router();
const controlContent = require("../controller/contents.controller");
const controlPage = require("../controller/pages.controller");
const controlAuth = require("../controller/auth.controller");
const controlEvent = require("../controller/event.controller");
const controlOrder = require("./order.controller");
const controlIteration = require("../controller/eventIterarion.controller");
const controlNews = require("../controller/news.controller");
const controlSubscribe = require("../controller/subscriber.controller");
const controlCart = require("../controller/carts.controller");
const controlTransaction = require('../controller/transaction.controller')
const controlParam = require('../controller/params.controller')
const controlObjekWisata = require('./objekWisata.controller')
const controlEmail = require('../controller/email.controller')
const controlQR = require('../controller/barcode.controller')
const controlUser = require('../controller/user.controller')
const controlSubType = require('../controller/orderSubType.controller')
const controlType = require('../controller/orderType.controller')
const controlCategory = require('../controller/category.controller')
const controlBookTimetable = require('../controller/bookTimetable.controller')
const controlAvailabilityTime = require('../controller/availabilityTime.controller')
const controlDiscount = require("../controller/discount.controller")

router.use("/content", controlContent);
router.use("/type", controlType)
router.use("/category", controlCategory)
router.use("/subtype", controlSubType)
router.use("/page", controlPage);
router.use("/auth", controlAuth);
router.use("/event", controlEvent);
router.use('/email', controlEmail)
router.use("/news", controlNews);
router.use('/trans', controlTransaction)
router.use("/items", controlOrder);
router.use("/cart", controlCart);
router.use('/qr', controlQR)
router.use("/subscribe", controlSubscribe);
router.use("/iteration", controlIteration);
router.use('/param', controlParam)
router.use('/wisata', controlObjekWisata)
router.use('/user', controlUser)
router.use('/book-timetable', controlBookTimetable)
router.use('/availability-time', controlAvailabilityTime)
router.use('/discount', controlDiscount)

module.exports = router;
