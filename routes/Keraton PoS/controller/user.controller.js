const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const userModel = require("../models/user.models");
const { verif } = require("../middlewares/verif");

expressRouter.post("/admin-login", async (req, res) => {
  try {
    const data = await userModel.logIn(req.body);
    return success(res, "Login berhasil", data);
  } catch (err) {
    return error(res, err.message);
  }
});

expressRouter.get("/admin-auth", verif, async (req, res) => {
  try {
    const data = await userModel.isExist(req.user.id);
    return success(res, "Autentikasi berhasil!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = expressRouter;
