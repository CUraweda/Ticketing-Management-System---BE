var express = require("express");
const { error, success } = require("../../utils/response");
var router = express.Router();
const userWebModel = require('../../../Website Keraton/models/user.models')
const { throwError } = require("../../utils/helper");
const { auth } = require("../../middlewares/auth");

router.get("/", auth, async (req, res) => {
    try {
        const userData = await userWebModel.getAll()
        return success(res, 'Success', userData)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router