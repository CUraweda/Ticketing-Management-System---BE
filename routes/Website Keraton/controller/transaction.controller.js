const { error, success } = require("../../utils/response");
const { auth } = require("../middlewares/auth");
const expressRouter = require("./auth.controller");
const transactionModel = require('../models/transaction.models')
var express = require('express');
const { validateCheckout } = require("../validation/checkout.valid");
var router = express.Router()

router.get('/all', auth(['SUPER_ADMIN', 'ADMIN'], async (req, res) => {
    try {
        const data = await transactionModel.getAll()
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
}))

router.get('/', auth(), async (req, res) => {
    try {
        const data = await transactionModel.getAll(req.user.id)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/', validateCheckout, auth(), async (req, res) => {
    const { carts, plannedDate, method } = req.body
    try {
        const payload = {
            user: req.user,
            carts: Object.values(carts),
            args: {
                plannedDate,
                method,
                ...(method === "CASH" && { status: "DAPAT_DIGUNAKAN" })
            }
        }
        const data = await transactionModel.createNew(payload)
        return success(res, 'Transaction successfully made', data)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router