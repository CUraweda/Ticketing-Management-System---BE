var express = require('express')
var router = express.Router()
const { success, error } = require("../../utils/response");
const subscribeModel = require('../models/subscribe.models')

router.get('/', async (req, res) => {
    try{
        const data = await subscribeModel.getAll()
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

router.post('/', async (req, res) => {
    try{
        const emailAlreadyExist = await subscribeModel.emailExist(req.body.email)
        if(emailAlreadyExist) throw Error('Email already subscribed')
        const data = await subscribeModel.create({ email: req.body.email })
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router