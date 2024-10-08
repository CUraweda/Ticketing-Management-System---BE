var express = require("express");
var router = express.Router();
const { error, success } = require("../../utils/response");
const eventModel = require("../models/events.models");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { convertFilesToURL } = require("../../utils/helper");

//Start Multer
const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/assets/events");
  },
  filename: (_req, file, cb) => {
    crypto.pseudoRandomBytes(16, (_err, raw) => {
      cb(null, raw.toString("hex") + path.extname(file.originalname));
    });
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      req.fileValidationError = "Only image file are allowed";
      cb(null, false);
      return;
    }
    cb(null, true);
  },
});
//End Multer

router.get("/:id?", async (req, res) => {
  const { id } = req.params, { search } = req.query;
  try {
    const data = id ? await eventModel.getOne(+id) : await eventModel.getAll({
      ...(search && { search })
    });
    return success(res, "Success", data);
  } catch (err) {
    return error(res, err.message);
  }
});
router.post("/page", async (req, res) => {
  try {
    const data = await eventModel.getAll(req.body);
    return success(res, "Success", data);
  } catch (err) {
    return error(res, err.message);
  }
});
router.post("/:ident/:id?", upload.single("image"), async (req, res) => {
  const { ident } = req.params;
  try {
    if (req.file) req.body.image = convertFilesToURL(req.file.path);
    req.body.price = parseFloat(req.body.price);
    req.body.iterationId = parseInt(req.body.iterationId);
    req.body.isFree = req.body.isFree != "false" ? true : false;
    const data =
      ident != "update"
        ? await eventModel.create(req.body)
        : await eventModel.update(+req.params.id, req.body);
    return success(res, "Action Success", data);
  } catch (err) {
    return error(res, err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const dataExist = await eventModel.isExist(+req.params.id);
    if (!dataExist) throw Error("Event ID Didnt Exist");
    const deleted = await eventModel.deleteData(dataExist.id);
    return success(
      res,
      `Event ${dataExist.name} Deleted Successfully`,
      deleted
    );
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
