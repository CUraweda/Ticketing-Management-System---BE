var express = require('express');
var router = express.Router();
const { error, success } = require('../../utils/response');
const orderTypeModel = require('../models/orderType.models')

router.get('/', async (req, res) => {
    try{
        const data = await orderTypeModel.getAll()
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
} )

router.post('/:id?', async (req, res) => {
    try{
        const data = req.params.id ? await orderTypeModel.createUpdate('update', { id: +req.params.id, ...req.body }) : await orderTypeModel.createUpdate('create', req.body)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try{
        const deletedData = await orderTypeModel.deleteSoft(+req.params.id)
        return success(res, 'Success', deletedData)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router