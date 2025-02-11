const express = require('express')
const { success, error } = require('../utils/response')
const router = express.Router()
const paymentModel = require('./payment.models')

router.get('/notify/:id', async (req, res) => {
    try {
        const data = await paymentModel.notify(req.params.id, {
            status: req.headers['x-status']
        })
        return success(res, 'Notify Success', data)
    } catch (e) {
        return error(res, e.message, 400)
    }
})

module.exports = router