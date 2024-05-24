const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const nationalityModel = require("../models/nationality.models");

expressRouter.get("/nationality-list", async (req, res) => {
  try {
    const data = await nationalityModel.getAll();
    return success(res, "Data Nationality berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter