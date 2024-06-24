var express = require("express");
const { error, success } = require("../../utils/response");
var router = express.Router();
const objeKWisataModel = require('../models/objekWisata.models');
const order = require('../models/order.models');
const e = require("express");

router.get('/:id?', async (req, res) => {
    let { id } = req.params, wisataData, orderData
    try {
        wisataData = id ? await objeKWisataModel.getOne({ where: { id: +id } }) : await objeKWisataModel.getAll()
        if (id) orderData = await order.getRelatedObjekWisata(wisataData.orderIdentifier)
        return success(res, 'Success', { wisataData, orderData })
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/:id?', async (req, res) => {
    let { id } = req.params
    if (id) req.body.id = +id
    try {
        const data = await objeKWisataModel.updateCreate(req.body)
        return success(res, `${id ? "update" : "Create"} Success`, data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try{
        const data = await objeKWisataModel.deleteHard(+req.params.id)
        return success(res, 'Deleted Successfully', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router
