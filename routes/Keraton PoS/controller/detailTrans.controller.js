const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const detailTransModel = require("../models/detailTrans.models");

expressRouter.get("/transaction-invoice", async (req, res) => {
  try {
    const data = await detailTransModel.getAll(req.query.search);
    return success(res, "Data Invoice berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/generate-tickets/:id", async (req, res) => {
  try {
    const data = await detailTransModel.getTickets(req.params.id);
    return success(res, "Data Tiket berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/table-data", async (req, res) => {
  try {
    const data = await detailTransModel.getTableData(req.query.category);
    return success(res, "Data Tabel berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/unavailable-guide", async (req, res) => {
  try {
    const data = await detailTransModel.getUnavailableGuide(req.query.date);
    return success(res, "Data Guide yang tidak tersedia berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter;
