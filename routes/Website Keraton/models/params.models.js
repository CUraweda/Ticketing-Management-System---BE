const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const getOne =  async (args) => {
    try{
        return await prisma.globalParam.findFirstOrThrow({ where: { ...args } })
    }catch(err){
        throwError(err)
    }
}

const getAll = async () => {
    try{
        return await prisma.globalParam.findMany()
    }catch(err){
        throwError(err)
    }
}

module.exports = { getOne, getAll }