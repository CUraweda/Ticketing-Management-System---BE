const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const eventIterationModel = require('../models/eventIteration.models')


const isExist = async (id) => {
    try{
        return await prisma.events.findFirst({ where: { id }})
    }catch(err){
        throwError(err)
    }
}

const getAll = async (query) => {
    let { iterat, free } = query
    try {
        console.log(query)
        return await prisma.events.findMany({
            where: {
                ...(iterat && { iterationId: { in: iterat } }),
                ...(free && { isFree: free })
            },
            include: { iteration: true }
        })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try{
        return await prisma.events.findFirstOrThrow({
            where: { id }
        })
    }catch(err){
        throwError(err)
    }
}

const iterationIdExist = async (id) => {
    try{
        const isExist = await eventIterationModel.isExist(+id)
        if(!isExist) throw Error('Iteration Id didnt exist')
    }catch(err){
        throwError(err)
    }
}

const create = async (data) => {
    try{
        await iterationIdExist(+data.iterationId)
        return await prisma.events.create({ data })
    }catch(err){
        throwError(err)
    }
}

const update = async (id, data) => {
    try{
        if (data.iterationId) await iterationIdExist(data.iterationId)
        const exist = await isExist(id)
        if(!exist) throw Error('Event Id didnt exist')
        return await prisma.events.update({ where: { id }, data })
    }catch(err){
        throwError(err)
    }
}


module.exports = { isExist, getOne, getAll, create, update }