const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const categoryModel = require("../models/category.models");

expressRouter.get("/category-details/:id?", async (req, res) => {
  try {
    const { id } = req.params;
    const data = id
      ? await categoryModel.getOne(req.params.id)
      : await categoryModel.getAll();
    return success(res, "Data Order berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post(
  "/category-action/:action/:id?",
  async (req, res) => {
    try {
      req.body.image = req.file
        ? req.file.originalname
        : req.body.imgName
        ? req.body.imgName
        : null;
      delete req.body.imgName;
      switch (req.params.action) {
        case "create":
          const data = await categoryModel.create(req.body);
          return success(res, "Penambahan kategori berhasil", data);
        case "update":
          await categoryModel.update(req.params.id, req.body);
          return success(res, "Update kategori berhasil!");
        case "delete":
          await categoryModel.deleteCategory(req.params.id);
          return success(res, "Penghapusan kategori berhasil!");
        default:
          throw new Error(`Aksi ${action} tidak ditemukan`);
      }
    } catch (err) {
      return error(res, err.message);
    }
  }
);

module.exports = expressRouter;
