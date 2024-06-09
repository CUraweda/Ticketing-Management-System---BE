const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { upload } = require("../../utils/helper");
const orderModel = require("../models/order.models");

expressRouter.get("/order-details/:id?", async (req, res) => {
  try {
    const { id } = req.params;
    const data = id
      ? await orderModel.getOne(req.params.id)
      : await orderModel.getAll();
    return success(res, "Data Order berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post(
  "/order-action/:action/:id?",
  upload.single("image"),
  async (req, res) => {
    try {
      req.body.image = req.file
        ? req.file.originalname
        : req.body.imgName
        ? req.body.imgName
        : null;
      delete req.body.imgName;
      req.body.categoryId = parseInt(req.body.categoryId);
      req.body.orderSubTypeId = parseInt(req.body.orderSubTypeId);
      req.body.price = parseFloat(req.body.price);
      switch (req.params.action) {
        case "create":
          const data = await orderModel.create(req.body);
          return success(res, "Penambahan pesanan berhasil", data);
        case "update":
          await orderModel.update(req.params.id, req.body);
          return success(res, "Update pesanan berhasil!");
        case "delete":
          await orderModel.deleteOrder(req.params.id);
          return success(res, "Penghapusan pesanan berhasil!");
        default:
          throw new Error(`Aksi ${action} tidak ditemukan`);
      }
    } catch (err) {
      return error(res, err.message);
    }
  }
);
expressRouter.get("/recent-purchase", async (req, res) => {
  try {
    const data = await orderModel.recentPurchase();
    return success(res, "Data Purchase Info berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/chart-data/:year/:month?", async (req, res) => {
  try {
    const data = req.params.month
      ? await orderModel.getMonthData(req.params.year, req.params.month)
      : await orderModel.getYearData(req.params.year);
    return success(res, "Data Chart berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter;
