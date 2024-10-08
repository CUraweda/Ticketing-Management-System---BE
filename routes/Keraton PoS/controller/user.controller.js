const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const userModel = require("../models/user.models");
const userKeratonModel = require('../../Website Keraton/models/user.models')
const { verif } = require("../middlewares/verif");
const { auth } = require("../middlewares/auth");

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
expressRouter.put("/update-carts", async (req, res) => {
  try {
    const data = await userModel.updateCarts(req.body);
    return success(res, "Update carts user berhasil!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get('/get-user-data/:id?', auth,  async (req, res) => {
  const { id } = req.params
  try{
    const data = id ? await userKeratonModel.isExist(id) : await userKeratonModel.getAll()
    return success(res, 'Data user berhasil di fetch', data)
  }catch(err){
    return error(res, err.message)
  }
})
expressRouter.post('/update-user-data/:id', auth,  async (req, res) => {
  const { id } = req.params
  try{
    const userExist = await userKeratonModel.isExist(id)
    if(!userExist) throw Error('User tidak ada di database')
    const data = await userKeratonModel.update(id, req.body)
    return success(res, 'Data user behasil di perbaiki', data)
  }catch(err){
    return error(res, err.message)
  }
})

module.exports = expressRouter;
