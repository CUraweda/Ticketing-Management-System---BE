const { success, error } = require("../../utils/response");
var express = require('express');
var router = express.Router()
const multer = require("multer");
const crypto = require('crypto');
const path = require('path');
const newsModel = require('../models/news.models');
const { convertFilesToURL } = require("../../utils/helper");

//Start Multer
const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'public/assets/news')
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

router.get('/:id?', async (req, res) => {
    const { id } = req.params
    try {
        const data = id ? await newsModel.getOne(+id) : await newsModel.getAll()
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/action/:id?', upload.single('image'), async (req, res) => {
    const { id } = req.params
    try {
        if (req.file) req.body.image = convertFilesToURL(req.file.path)
        const data = id ? await newsModel.update(+id, req.body) : await newsModel.create(req.body)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const dataExist = await newsModel.isExist(+req.params.id)
        if (!dataExist) throw Error('News ID Didnt Exist')
        const deleted = await newsModel.deleteData(dataExist.id)
        return success(res, `News ${dataExist.title} Deleted Successfully`, deleted)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router