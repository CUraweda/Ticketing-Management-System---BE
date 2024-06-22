const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const isExist = async (id) => {
    try{
        return await prisma.events.findFirst({ where: { id: +id }})
    }catch(err){
        throwError(err)
    }
}

const getAll = async () => {
    try {
        return await prisma.eventIteration.findMany({ orderBy: { id: 'asc' } })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try{
        return await prisma.eventIteration.findFirstOrThrow({
            where: { id }
        })
    }catch(err){
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll }
