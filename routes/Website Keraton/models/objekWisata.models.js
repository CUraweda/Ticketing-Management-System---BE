const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const getAll = async (query = {}) => {
    try{
        return await prisma.objekWisata.findMany({ ...query })
    }catch(err){
        throwError(err)
    }
}

const getOne = async (query = {}) => {
    try{
        return await prisma.objekWisata.findFirst({ ...query })
    }catch(err){
        throwError(err)
    }
}

module.exports = { getAll, getOne }