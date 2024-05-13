const { throwError, generateRandomString } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const bcrypt = require('bcrypt')

async function isExist(obj) {
    const data = await prisma.user.findFirst({ where: { ...obj } })
    return data
}

const getAll = async () => {
    try{
        return await prisma.user.findMany()
    }catch(err){
        throwError(err)
    }
}

const generateToken = async () => {
    try {
        let generatedToken, tokenExist;
        do {
            generatedToken = generateRandomString(100);
            tokenExist = await prisma.tokens.findUnique({ where: { id: generatedToken } }); //Check if token is existed in database
        } while (tokenExist != null)
        return generatedToken;
} catch (err) {
        throwError(err)
    }
}

const logIn = async (body) => {
    let { email, password } = body
    try {
        const userExist = await isExist({ email })
        if (!userExist) throw Error('Email didnt registered')
        await bcrypt.compare(password, userExist.password).then(match => { if (!match) throw Error('Password didnt Match') })
        const generatedToken = await generateToken()
        await prisma.tokens.create({ data: { id: generatedToken, userId: userExist.id } })
        return { generatedToken, userExist }
    } catch (err) {
        throwError(err)
    }
}

const logOut = async (id) => {
    try{
        return await prisma.tokens.deleteMany({ where: { userId: id } })
    }catch(err){
        throwError(err)
    }
}

module.exports = {
    getAll,
    logIn,
    logOut
}
