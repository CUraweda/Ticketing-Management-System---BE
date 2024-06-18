var express = require('express');
var router = express.Router();
const { error, success } = require('../../utils/response');
const cartModel = require('../models/carts.model');
const { auth } = require('../middlewares/auth');

router.post('/break', auth([]), async (req, res) => {
    try {
        const carts = await cartModel.action('break', req.user.id, Object.values(res.body.carts))
        return success(res, 'Cart Successfully Deleted', carts)
    } catch (err) {
        return error(res, err.message)
    }
})

router.get('/', auth([]), async (req, res) => {
    const { cartsKeraton } = req.user
    try {
        return success(res, 'Success', cartsKeraton)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/update', auth([]), async (req, res) => {
    try {
        const data = await cartModel.updateCart(req.user.id, req.body.cart)
        return success(res, 'Update Successfully', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/validate', async (req, res) => {
    try {
        const cartData = Object.values(req.body.carts)
        if (cartData.length < 1) throw Error('No item to validate')
        const data = await cartModel.validate(cartData)
        return success(res, 'Validated', data)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router