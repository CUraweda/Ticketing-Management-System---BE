const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const transactionModel = require("../models/transaction.models");

expressRouter.get("/income-revenue", async (req, res) => {
  try {
    const data = await transactionModel.getRevenue();
    return success(res, "Data Income berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/create-transaction", async (req, res) => {
  try {
    const data = await transactionModel.create(
      req.body,
      req.body.name,
      req.body.nationality
    );
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
