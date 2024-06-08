var express = require("express");
const { error, success } = require("../../utils/response");
var router = express.Router();
const userModel = require('../models/user.models')
const { auth } = require("../middlewares/auth");
const { throwError } = require("../../utils/helper");
const { route } = require("./contents.controller");

router.get("/", auth(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        const userData = await userModel.getAll()
        return success(res, 'Success', userData)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post("/:id?", auth(['SUPER_ADMIN']), async (req, res) => {
    let updatedUser
    try {
        if (req.params.id) {
            const userExist = await userModel.isExist(req.params.id)
            if (!userExist) throw Error('User didnt exist')
            updatedUser = await userModel.update(userExist.id, req.body)
        } else updatedUser = await userModel.create(req.body)
        return success(res, 'Update Success', updatedUser)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', auth(['SUPER_ADMIN']), async (req, res) => {
    try {
        const userExist = await userModel.isExist(id)
        if (!userExist) throw Error('User didnt exist')
        const deletedUser = await userModel.deleteSoftUser(userExist.id)
        return success(res, 'Deleted Successfully', deletedUser)
    } catch (err) {
        throwError(err)
    }
})

module.exports = router