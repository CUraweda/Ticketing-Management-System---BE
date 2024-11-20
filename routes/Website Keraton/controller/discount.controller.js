const { error, success } = require("../../utils/response");
var express = require('express')
var router = express.Router()
const discountModel = require('../models/discount.models')
const {createUpdateValidation } = require('../validation/discount.valid')

router.get('/', async (req, res) => {
    try {
        const data = await discountModel.getAll(req.query)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.get('/:id?', async (req, res) => {
    try {
        if (!req.params.id) throw Error("Please provide an ID")
        const data = await discountModel.getOne(+req.params.id)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/', createUpdateValidation, async (req, res) => {
    try {
        const data = await discountModel.create(req.body)
        return success(res, 'Action Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.put('/:id', createUpdateValidation, async (req, res) => {
    try {
        if (!req.params.id) throw Error("Please provide an ID")
        const data = await discountModel.update(+req.params.id, req.body)
        return success(res, 'Action Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        if (!req.params.id) throw Error("Please provide an ID")
        const deleted = await discountModel.deleteSoft(+req.params.id)
        return success(res, `Discount ${deleted.code} Deleted Successfully`, deleted)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router