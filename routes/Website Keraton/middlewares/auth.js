const { prisma } = require("../../utils/prisma");
const { error } = require("../../utils/response")

const auth = (listAccessible = []) => async (req, res, next) => {
    const { authorization } = req.headers;
    try {
        if (!authorization) throw Error('Forbiden Authorization token is not found')
        const token = authorization.split(' ')[1];
        console.log(token)
        const tokenExist = await prisma.token.findFirst({ where: { token }, select: { user: true } })
        console.log(tokenExist)
        if (!tokenExist) throw Error('Sorry, token didnt exist')
        if (listAccessible.length > 0) {
            const isAccessible = access.some((acc) => tokenExist.user.role.includes(acc))
            if (!isAccessible) return error(res, 'Forbidden, you have no access to this resource', 403)
        }
        req.user = tokenExist.user
        req.token = token
        return next()
    } catch (err) {
        return error(res, err.message)
    }

}

module.exports = { auth }