const { success, error } = require("../../utils/response");
var express = require('express');
var router = express.Router()
const newsModel = require('../models/news.models')

router.get('/:id?', async(req, res) => {
    const { id  } = req.params
    try{
        const data = id ? await newsModel.getOne(+id) : await newsModel.getAll()
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.post('/action/:id?', async (req, res) => {
    const { id } = req.params
    try{
        const data = id ? await newsModel.create(req.body) : await newsModel.update(+id, req.body)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try{
        const dataExist = await newsModel.isExist(+req.params.id)
        if(!dataExist) throw Error('News ID Didnt Exist')
        const deleted = await newsModel.deleteData(dataExist.id)
        return success(res, `News ${dataExist.name} Deleted Successfully`, deleted)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router