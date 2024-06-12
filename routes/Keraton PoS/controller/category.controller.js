const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { upload, throwError } = require("../../utils/helper");
const categoryModel = require("../models/category.models");

expressRouter.get("/category-details", async (req, res) => {
  try {
    const data = await categoryModel.getAll();
    return success(res, "Data Order berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/category-action/:action/:id?", upload.none(), async (req, res) => {
  try {
    req.params.id = parseInt(req.params.id)
    req.body = Object.assign({}, req.body);
    const nameExist = await categoryModel.findUniqueName(req.body)
    if (req.params.action != "delete") {
      if (nameExist) {
        if (!nameExist.disabled) throw Error('Name already exist')
        // if(req.params.id && !nameExist.disabled) throw Error('')
        if (!req.params.id) req.params.id = nameExist.id
        req.params.action = "update"
        req.body.disabled = false
      }
    }
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
    console.log(err)
    return error(res, err.message);
  }
}
);

module.exports = expressRouter;
