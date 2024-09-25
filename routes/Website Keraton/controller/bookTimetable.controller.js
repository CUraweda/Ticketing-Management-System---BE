const { success, error } = require("../../utils/response");
var express = require('express');
var router = express.Router()
const bookTimetableModel = require('../models/bookTimetable.model');

router.get('/', async (req, res) => {
    try {
        const data = await bookTimetableModel.getAll(req.query)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params
    try{
        const data = await bookTimetableModel.getOne(+id)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const data =  await bookTimetableModel.create(req.body)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const data = await bookTimetableModel.update(+id, req.body)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const dataExist = await bookTimetableModel.isExist(+req.params.id)
        if (!dataExist) throw Error('BookTimetable ID Didnt Exist')
        const deleted = await bookTimetableModel.deleteSoft(dataExist.id)
        return success(res, `BookTimetable ${dataExist.title} Deleted Successfully`, deleted)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router