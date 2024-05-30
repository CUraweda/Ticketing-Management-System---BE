var express = require("express");
const { auth } = require("../middlewares/auth");
const { error, success } = require("../../utils/response");
var router = express.Router();
const paramModel = require('../models/params.models');
const { throwError } = require("../../utils/helper");

router.get('/checkout', auth([]), async(req, res) =>  {
    try{
        const data = await paramModel.getOne({ identifier: "KeratonAppTax"  })
        delete data.identifier
        delete data.id
        return success(res, 'Success', data)
    }catch(err){
        throwError(err)
    }
})

router.get('/:id?', auth([]), async(req, res) => {
    const { id } = req.params
    try{
        const data = id ? await paramModel.getOne({ id: +id }) : await  paramModel.getAll()
        return success(res, 'Success', data)
    }catch(err){
        return  error(res, err.message)
    }
})


module.exports = router