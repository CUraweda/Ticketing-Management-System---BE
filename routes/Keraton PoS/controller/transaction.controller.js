const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const transactionModel = require("../models/transaction.models");

expressRouter.get("/detail-invoice", async (req, res) => {
  try {
    const data = await transactionModel.getInvoice(req.query.search);
    return success(res, "Data Invoice berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/income-revenue", async (req, res) => {
  try {
    const data = await transactionModel.getRevenue();
    return success(res, "Data Income berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/generate-tickets/:id", async (req, res) => {
  try {
    const data = await transactionModel.getTickets(req.params.id);
    return success(res, "Data Tiket berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/print-transaction", async (req, res) => {
  try {
    await transactionModel.printTransaction(req.body);
    return success(res, "Data Tiket berhasil diprint!");
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/create-transaction", async (req, res) => {
  try {
    const data = await transactionModel.create(req.body);
    return success(res, "Penambahan pesanan berhasil", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/target-revenue/:date", async (req, res) => {
  try {
    const data =
      req.params.date === "year"
        ? await transactionModel.getYear()
        : await transactionModel.getMonth();
    return success(res, "Data Invoice berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter;
