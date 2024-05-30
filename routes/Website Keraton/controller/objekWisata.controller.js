var express = require("express");
const { error, success } = require("../../utils/response");
var router = express.Router();
const objeKWisataModel = require('../models/objekWisata.models');
const order = require('../models/order.models')

router.get('/:id?', async (req, res) => {
    let { id } = req.params, wisataData, orderData
    try{
        wisataData = id ? await objeKWisataModel.getOne({ where: { id: +id } }) : await objeKWisataModel.getAll()
        if(id) orderData = await order.getRelatedObjekWisata(wisataData.orderIdentifier)
        return success(res, 'Success', { wisataData, orderData })
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router
