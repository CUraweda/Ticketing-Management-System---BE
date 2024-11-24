const { error, success } = require("../../utils/response");
const { auth } = require("../middlewares/auth");
const expressRouter = require("./auth.controller");
const transactionModel = require('../models/transaction.models')
const bookTimetableModel = require('../models/bookTimetable.model')
const { validateCheckout, validateCheckoutJanji } = require("../validation/checkout.valid");
var express = require('express');
const { throwError } = require("../../utils/helper");
var router = express.Router()

router.get('/all', auth(['SUPER_ADMIN', 'ADMIN'], async (req, res) => {
    try {
        const data = await transactionModel.getAll()
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
}))

router.get('/pay/:transactionId', async (req, res) => {
    try{
        const verificationExist = req.headers['x-ver']
        if(!verificationExist) throw Error('Verification Header didnt exist')
        if(verificationExist && verificationExist != process.env.ENCRYPTION_PAYMENT) throw Error('Verification Header data is incorrect')
        const transactionExist = await transactionModel.getOneTransaction(req.params.transactionId)
        await transactionModel.update(transactionExist.id, { status: "DAPAT_DIGUNAKAN" })
        return success(res, 'Payment Successfully made')
    }catch(err){
        throwError(err)
    }
})

router.get('/', auth(), async (req, res) => {
    try {;
        const data = await transactionModel.getAll(req.user.id, req.query)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/janji', validateCheckoutJanji, auth(), async(req, res) => {
    const { temp_cart, temp_user_data, method } = req.body
    try{
        const payload = {
            user: req.user,
            carts: Object.values(temp_cart),
            args: {
                plannedDate: temp_user_data.datetime,
                method,
                ...(method === "CASH" && { status: "DAPAT_DIGUNAKAN" })
            }
        }
        const data = await transactionModel.createNew(payload)
        const bookTimetableData = await bookTimetableModel.create({ 
            ...temp_user_data,
            user: { connect: { id: req.user.id } },
            transaction: { connect: { id: data.createdTransacation.id } }
         })
        return success(res, 'Transaction successfully made', { data, bookTimetableData })
    }catch(err){
        return error(res, err.message)
    }
})

router.post('/', validateCheckout, auth(), async (req, res) => {
    const { carts, plannedDate, method, discount_code, pay_percentage } = req.body
    try {
        const payload = {
            user: req.user,
            carts: Object.values(carts),
            args: {
                plannedDate,
                method,
                discountCode: discount_code,
                payPercentage: pay_percentage,
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