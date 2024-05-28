const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { upload } = require("../../utils/helper");
const orderTypeModel = require("../models/orderType.models");

expressRouter.get("/type-details", async (req, res) => {
  try {
    const data = await orderTypeModel.getAll();
    return success(res, "Data Order berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post(
  "/type-action/:action/:id?",
  upload.none(),
  async (req, res) => {
    try {
      req.params.id = parseInt(req.params.id)
      req.body = Object.assign({}, req.body);
      switch (req.params.action) {
        case "create":
          const data = await orderTypeModel.create(req.body);
          return success(res, "Penambahan tipe pesanan berhasil", data);
        case "update":
          await orderTypeModel.update(req.params.id, req.body);
          return success(res, "Update tipe pesanan berhasil!");
        case "delete":
          await orderTypeModel.deleteOrderType(req.params.id);
          return success(res, "Penghapusan tipe pesanan berhasil!");
        default:
          throw new Error(`Aksi ${action} tidak ditemukan`);
      }
    } catch (err) {
      return error(res, err.message);
    }
  }
);

module.exports = expressRouter;
