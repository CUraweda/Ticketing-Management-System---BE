var express = require("express");
var router = express.Router();
const controlUser = require("./user.controller");
const controlOrder = require("./order.controller");
const controlOrderType = require("./orderType.controller");
const controlOrderSubType = require("./orderSubType.controller");
const controlTransaction = require("./transaction.controller");
const controlDetailTrans = require("./detailTrans.controller");
const controlGuide = require("./guide.controller");
const controlNationality = require("./nationality.controller");
const controlCategory = require("./category.controller");
const controlLogs = require("./logs.controller");
const controlKeratonTransaction = require('../controller/keratonTransaction.controller')

router.use("/user", controlUser);
router.use("/order", controlOrder);
router.use("/order-type", controlOrderType);
router.use("/order-subtype", controlOrderSubType);
router.use("/transaction", controlTransaction);
router.use("/detail-trans", controlDetailTrans);
router.use("/guide", controlGuide);
router.use("/nationality", controlNationality);
router.use("/category", controlCategory);
router.use("/logs", controlLogs);
router.use('/curaweda-income', controlKeratonTransaction)

module.exports = router;