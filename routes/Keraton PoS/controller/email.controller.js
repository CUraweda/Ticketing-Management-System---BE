const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const emailModels = require("../models/email.models");

expressRouter.post("/email-transaction", async (req, res) => {
  try {
    const data = await emailModels.sendEmailToUser(req.body);
    return success(res, "Email berhasil dikirimkan!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter;