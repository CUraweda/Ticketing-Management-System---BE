const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { upload } = require("../../utils/helper");
const guideModel = require("../models/guide.models");

expressRouter.get("/guide-list/:id?", async (req, res) => {
  try {
    const data = req.params.id
      ? await guideModel.getOne(req.params.id)
      : await guideModel.getAll();
    return success(res, "Data Guide berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});

expressRouter.post(
  "/guide-action/:action/:id?",
  upload.single("image"),
  async (req, res) => {
    const action = req.params.action;
    try {
      req.body.image = req.file ? req.file.originalname : req.body.imgName ? req.body.imgName : null;
      delete req.body.imgName;
      let data;
      switch (action) {
        case "create":
          data = await guideModel.createUpdate('create',req.body);
          break;
        case "update":
          data = await guideModel.createUpdate('update', { id: req.params.id, ...req.body });
          break;
        case "delete":
          data = await guideModel.deleteGuide(req.params.id);
          break;
        default:
          throw new Error(`Action ${action} tidak ditemukan`);
      }
      return success(res, "Aksi berhasil", data);
    } catch (err) {
      return error(res, err.message);
    }
  }
);

module.exports = expressRouter;