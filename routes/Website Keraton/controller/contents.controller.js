var express = require("express");
var router = express.Router();
const { throwError } = require("../../utils/helper");
const { success, error } = require("../../utils/response");
const contentModel = require("../models/contents.models");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { captureRejections } = require("nodemailer/lib/xoauth2");

// Start Multer
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
  const { id } = req.params;
  try {
    const data = id ? await contentModel.getOne(+id) : await contentModel.getAll();
    return success(res, "Get Success", data);
  } catch (err) {
    return error(res, err.message);
  }
});

// Note : Tolong Jangan ubah imageList jadi imageList[] (unknown field)
router.post("/:ident/:id?", upload.array("imageList[]"), async (req, res) => {
  let sendedData, listOfFiles = [], listOfDefaultImage = [], imageDatas = [], currentFileIndex = 0, currentDefaultImageIndex = 0
  try {
    if (req.files) listOfFiles = req.files
    listOfDefaultImage = req.body.imageList
    for (let imageData of req.body.imageSub) {
      let data = imageData.isAFile != "false" ? listOfFiles[currentFileIndex] : listOfDefaultImage[currentDefaultImageIndex]
      imageData.isAFile != "false" ? currentFileIndex++ : currentDefaultImageIndex++
      imageDatas.push({ data, ...imageData.subData })
    }
    req.body.imageList = imageDatas
    if (req.body.pageId) req.body.pageId = +req.body.pageId;
    if (req.body.sectionOrder) req.body.sectionOrder = +req.body.sectionOrder;
    if (req.params.ident != "create") {
      sendedData = await contentModel.createUpdate("update", +req.params.id, req.body);
    } else
      sendedData = await contentModel.createUpdate("create", null, req.body);
    return success(res, "Action success", sendedData);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
