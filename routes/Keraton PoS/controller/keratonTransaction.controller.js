var express = require("express");
const { error, success } = require("../../utils/response");
var router = express.Router();
const keratonTransactionModel = require('../models/keratonTransaction.models')

router.post('/transfer', async (req, res) => {
    try{
        const data = await keratonTransactionModel.createTransafer(req.body)
        return success(res, 'Transfer Successfully', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.get('/', async  (req, res) => {
    try{
        const data = await keratonTransactionModel.get(req.query)
        return success(res, 'Get Successfully', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router