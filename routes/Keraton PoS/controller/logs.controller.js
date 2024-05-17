const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const logsModel = require("../models/logs.models");

expressRouter.get("/database-logs", async (req, res) => {
  try {
    const data = await logsModel.getAll(req.query.search);
    return success(res, "Database logs berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter