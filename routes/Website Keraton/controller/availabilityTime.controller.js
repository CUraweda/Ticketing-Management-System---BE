const { success, error } = require("../../utils/response");
var express = require('express');
var router = express.Router()
const availabilityTimeModel = require('../models/availabilityTime.models');

router.get('/', async (req, res) => {
    try {
        const data = await availabilityTimeModel.getAll(req.query)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params
    try{
        const data = await availabilityTimeModel.getOne(+id)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const data =  await availabilityTimeModel.create(req.body)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const data = await availabilityTimeModel.update(+id, req.body)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const dataExist = await availabilityTimeModel.isExist(+req.params.id)
        if (!dataExist) throw Error('AvailabilityTime ID Didnt Exist')
        const deleted = await availabilityTimeModel.deleteSoft(dataExist.id)
        return success(res, `AvailabilityTime ${dataExist.title} Deleted Successfully`, deleted)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router