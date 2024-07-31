const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { error, success } = require("../../../utils/response");
const expressRouter = require("../../controller/user.controller");
const { auth } = require("../../middlewares/auth");
const backupService = require("./backup.service");

// Multer Initialization
const allowedMimeTypes = ["application/json"];
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/backup");
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
      req.fileValidationError = "Only JSON file are allowed";
      cb(null, false);
      return;
    }
    cb(null, true);
  },
});
// Multer End

expressRouter.get("/get-dataref/:databaseName?", async (req, res) => {
  const { databaseName } = req.params;
  try {
    const data = databaseName
      ? await backupService.getDataReference(databaseName)
      : await backupService.getAllTabel();
    return success(res, "Data Reference berhasil didapatkan", data);
  } catch (err) {
    return error(res, err.message);
  }
});

expressRouter.post(
  "/backup-data",
  upload.single("jsonFile"),
  async (req, res) => {
    try {
      if (req.file)
        await backupService.storeBackup(req.file.path, req.body.rdb);
      return success(res, "Backup berhasil", "Data stored successfully");
    } catch (err) {
      console.log(err);
      return error(res, err.message);
    }
  }
);

module.exports = expressRouter;
