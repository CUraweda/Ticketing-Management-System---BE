var express = require('express');
var router = express.Router();
const { error, success } = require('../../utils/response');
const categoryModel = require('../../Keraton PoS/models/category.models')

router.post('/:id?', async (req, res) => {
    try {
        req.params.id = +req.params.id
        const nameExist = await categoryModel.findUniqueName(req.body)
        if(nameExist){
            if (nameExist.disabled && !req.params.id) {
                req.params.id = nameExist.id
                req.params.action = "update"
                req.body.disabled = false
            } else if (!nameExist.disabled) throw Error('Name already exist')
        }
        const data = req.params.id ? await categoryModel.update(req.params.id, req.body) : await categoryModel.create(req.body)
        return success(res, 'Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deletedData = await categoryModel.deleteCategory(+req.params.id)
        return success(res, 'Deleted Successfully', deletedData)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router