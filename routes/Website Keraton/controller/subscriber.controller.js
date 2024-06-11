var express = require('express')
var router = express.Router()
const { success, error } = require("../../utils/response");
const subscribeModel = require('../models/subscribe.models')

router.get('/', async (req, res) => {
    try {
        const data = await subscribeModel.getAll()
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/:id?', async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            const emailAlreadyExist = await subscribeModel.emailExist(req.body.email)
            if (emailAlreadyExist) throw Error('Email already subscribed')
        }
        const data = id ? await subscribeModel.update(+id, req.body) :  await subscribeModel.create({ email: req.body.email })
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deletedEmail = await subscribeModel.deleteHard(+req.params.id)
        return success(res, 'Deleted Successfully', deletedEmail)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router