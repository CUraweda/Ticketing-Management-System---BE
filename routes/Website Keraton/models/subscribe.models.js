const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const getAll = async () => {
    try{
        return await prisma.subscriber.findMany()
    }catch(err){
        throwError(err)
    }
}

const emailExist = async () => {
    try{
        return await prisma.subscriber.findFirst({ where: { email } })
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

const deleteHard = async (id) => {
    try{
        return await prisma.subscriber.delete({ where: { id } })
    }catch(err){
        throwError(err)
    }
}

module.exports = { getAll, create, emailExist, deleteHard}