const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { upload } = require("../../utils/helper");
const categoryModel = require("../models/category.models");

expressRouter.get("/category-details", async (req, res) => {
  try {
    const data = await categoryModel.getAll();
    return success(res, "Data Order berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post(
  "/category-action/:action/:id?",
  upload.none(),
  async (req, res) => {
    try {
      req.params.id = parseInt(req.params.id)
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
