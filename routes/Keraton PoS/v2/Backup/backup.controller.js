const { upload } = require("../../../utils/helper");
const { error, success } = require("../../../utils/response");
const expressRouter = require("../../controller/user.controller");
const { auth } = require("../../middlewares/auth");
const backupService = require('./backup.service')

expressRouter.get('/get-dataref/:databaseName?', async (req, res) => {
    const { databaseName } = req.params
    try{
        const data = databaseName ? await backupService.getDataReference(databaseName) : await backupService.getAllTabel()
        return success(res, 'Data Reference berhasil didapatkan', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = expressRouter