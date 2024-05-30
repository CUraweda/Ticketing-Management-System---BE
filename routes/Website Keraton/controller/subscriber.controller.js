const { success, error } = require("../../utils/response");
const { expressRouter } = require("../../utils/router");
const subscribeModel = require('../models/subscribe.models')

expressRouter.post('/', async (req, res) => {
    try{
        const data = await subscribeModel.create({ email: req.body.email })
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = expressRouter