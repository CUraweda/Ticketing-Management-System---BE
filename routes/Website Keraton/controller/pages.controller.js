const { throwError } = require("../../utils/helper");
const { success, error } = require("../../utils/response");
var express = require('express')
var router = express.Router()
const pagesModels = require('../models/pages.models')

router.get('/content/:id', async (req, res) => {
    let { id } = req.params
    try {
        const contents = await pagesModels.getAllContent(+id)
        return success(res, 'Success', contents)
    } catch (err) {
        throwError(err)
    }
})

router.get('/:id?', async (req, res) => {
    let { id } = req.params
    try {
        const data = id ? await pagesModels.getOne(id) : await pagesModels.getAll()
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})



module.exports = router