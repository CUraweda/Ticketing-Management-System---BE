const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const getAll = async () => {
    try{
        return await prisma.subscriber.findMany()
    }catch(err){
        throwError(err)
    }
}

const create = async (data) => {
    try{
        return await prisma.subscriber.create({ data })
    }catch(err){
        throwError(err)
    }
}

module.exports = { getAll, create }