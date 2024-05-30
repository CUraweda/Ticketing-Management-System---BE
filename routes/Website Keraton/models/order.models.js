const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const subTypeModel =  require('../models/orderSubType.models')

const isExist = async (id) => {
    try{
        return await prisma.order.findFirst({ where: { id } })
    }catch(err){
        throwError(err)
    }
}

const getAll = async (query = { type, subType}) => {
    let { type, subType } = query
    try {
        return await prisma.order.findMany({
            where: {
                orderSubType: {
                    ...(subType != undefined && {id: +subType}),
                    ...(type != undefined && { typeId: +type })
                }
            },
            include: { orderSubType: true }
        })
    } catch (err) {
        throwError(err)
    }
}

const getRelatedObjekWisata = async (identifier) => {
    try{
        return await prisma.order.findMany({
            where: { wisataRelation: { contains: identifier} },
            orderBy: { orderSubTypeId: 'asc' }
        })
    }catch(err){
        throwError(err)
    }
}

const getOne = async (id) => {
    try{
        return await prisma.order.findFirstOrThrow({
            where: { id }
        })
    }catch(err){
        throwError(err)
    }
}

const createUpdate = async (ident,data = { id, name, desc, unit, price, priceUmum, priceMancanegara, image, subTypeId }) => {
    try{
        if(ident != 'edit'){
            const subType = await subTypeModel.isExist(data.subTypeId)
            if(!subType) throw Error('Sub Type didnt exist')
        }
        return ident != 'edit' ? await prisma.order.create({ data }) : await prisma.order.update({ where: { id: data.id }, data })
    }catch(err){
        throwError(err)
    }
}

const deleteData = async (id) => {
    try{
        return await prisma.order.delete({ where: { id } })
    }catch(err){
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll, createUpdate, getRelatedObjekWisata, deleteData }