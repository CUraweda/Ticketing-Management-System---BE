const { error, success } = require("../../utils/response")
const { expressRouter } = require("../../utils/router")
const { auth } = require("../middlewares/auth")
const authModels = require('../models/user.models')

expressRouter.get('/', async (req, res) => {
    try{
        const users = await authModels.getAll()
        return success(res, 'Success', users)
    }catch(err){
        return error(res, err.message)
    }
})

expressRouter.post('/login', async (req, res) => {
    let expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
    try {
        const data = await authModels.logIn(req.body)
        res.cookie('refresh_token', data.generatedToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires
        });
        delete data.userExist.password
        delete data.userExist.id
        return success(res, 'Log In Success', data)
    } catch (err) {
        return error(res, err.message)
    }
})

expressRouter.post('/logout', auth(), async (req, res) => {
    try {
        await authModels.logOut(req.user.id)
        res.clearCookie('refresh_token');
        return success(res, 'Log Out Success')
    } catch (err) {
        return error(res, err.message)  
    }
})

module.exports = expressRouter