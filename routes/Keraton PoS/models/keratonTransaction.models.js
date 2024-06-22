const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const createTransafer = async (data) => {
    try{
        return await prisma.keratonTransaction.create({ data })
    }catch(err){
        throwError(err)
    }
}

const get = async (args = {}) => {
    try{
        return await prisma.keratonTransaction.findMany({ where: { ...args } })
    }catch(err){
        throwError(err)
    }
}

module.exports = { createTransafer, get }