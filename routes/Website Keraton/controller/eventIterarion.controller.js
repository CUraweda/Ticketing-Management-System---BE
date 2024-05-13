var express = require('express')
var router = express.Router()
const { error, success } = require("../../utils/response");
const iterationModel = require('../models/eventIteration.models');

router.get('/:id?', async (req, res) => {
    const { id } =  req.params
    try{
        const data = id ? await iterationModel.getOne(+id) :  await iterationModel.getAll(req.query)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router