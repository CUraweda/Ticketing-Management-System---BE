const { success, error } = require("../../utils/response");
const { expressRouter } = require("../../utils/router");
const newsModel = require('../models/news.models')

expressRouter.get('/:id?', async(req, res) => {
    const { id  } = req.params
    try{
        const data = id ? await newsModel.getOne(+id) : await newsModel.getAll()
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

expressRouter.post('/action/:id?', async (req, res) => {
    const { id } = req.params
    try{
        const data = id ? await newsModel.create(req.body) : await newsModel.update(+id, req.body)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports =  expressRouter