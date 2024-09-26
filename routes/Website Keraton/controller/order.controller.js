const { prisma } = require("../../utils/prisma");
const { error, success } = require("../../utils/response");
var express = require('express')
var router = express.Router()
const orderModel = require('../models/order.models')
const orderSubTypeModel = require('../models/orderSubType.models')
const orderTypeModel = require('../models/orderType.models')
const objekWisataModel = require('../models/objekWisata.models')
const eventIterationModel = require('../models/eventIteration.models')
const categoryModel = require('../../Keraton PoS/models/category.models')
const multer = require("multer");
const crypto = require('crypto');
const path = require('path')
const { convertFilesToURL } = require("../../utils/helper");

//Start Multer
const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'public/assets/events')
    },
    filename: (_req, file, cb) => {
        crypto.pseudoRandomBytes(16, (_err, raw) => {
            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            req.fileValidationError = 'Only image file are allowed'
            cb(null, false)
            return
        }
        cb(null, true)
    }
})
//End Multer
router.get('/booking', async (req, res) => {
    try {
        const order = await orderSubTypeModel.getAll()
        return success(res, 'Success', order)
    } catch (err) {
        return error(res, err.message)
    }
})

router.get('/helper', async (req, res) => {
    try {
        const subTypes = await orderSubTypeModel.getAll()
        const types = await orderTypeModel.getAll()
        const category = await categoryModel.getAll()
        const iteration = await eventIterationModel.getAll()
        const objekWisata = await objekWisataModel.getAll()
        return success(res, 'Success', { subTypes, iteration, types, category, objekWisata })
    } catch (err) {
        return error(res, err.message)
    }
})

router.get('/:id?', async (req, res) => {
    const { id } = req.params
    try {
        const data = !id ? await orderModel.getAll(req.query) : await orderModel.getOne(+id)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})


router.post('/:ident', upload.single('image'), async (req, res) => {
    const { ident } = req.params
    const { price, categoryId, subTypeId } = req.body
    try {
        if (req.file) req.body.image = convertFilesToURL(req.file.path)
        if(price) req.body.price = parseFloat(price)
        if(categoryId) req.body.categoryId = parseInt(categoryId)
        if(subTypeId) req.body.orderSubTypeId = parseInt(subTypeId)
        const data = await orderModel.createUpdate(ident, req.body)
        return success(res, 'Action Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const dataExist = await orderModel.isExist(req.params.id)
        if (!dataExist) throw Error('Order ID Didnt Exist')
        const deleted = await orderModel.deleteData(dataExist.id)
        return success(res, `Order ${dataExist.name} Deleted Successfully`, deleted)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router