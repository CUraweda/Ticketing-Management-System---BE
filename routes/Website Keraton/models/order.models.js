const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const subTypeModel = require('../models/orderSubType.models')

const isExist = async (id) => {
    try {
        return await prisma.order.findFirst({ where: { id } })
    } catch (err) {
        throwError(err)
    }
}

const getAll = async (query = { type, subType, search }) => {
    let { type, subType, search } = query
    try {
        return await prisma.order.findMany({
            where: {
                orderSubType: {
                    ...(subType != undefined && { id: +subType }),
                    ...(type != undefined && { typeId: +type }),
                },
                ...(search && {name: { contains: search }}),
                // ...(search && { name: { contains: search } }),
                deleted: false
            },
            include: { orderSubType: true, category: true }
        })
    } catch (err) {
        throwError(err)
    }
}

const getRelatedObjekWisata = async (identifier) => {
    try {
        return await prisma.order.findMany({
            where: { wisataRelation: { contains: identifier }, deleted: false },
            orderBy: { orderSubTypeId: 'asc' }
        })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try {
        return await prisma.order.findFirstOrThrow({
            where: { id, deleted: false }
        })
    } catch (err) {
        throwError(err)
    }
}

const createUpdate = async (ident, data = { id, name, desc, unit, price, image, orderSubTypeId, categoryId }) => {
    try {
        if (data.categoryId) {
            data.category = {
                connect: { id: data.categoryId }
            }
            delete data.categoryId
        }
        if (data.orderSubTypeId) {
            data.orderSubType = {
                connect: { id: data.orderSubTypeId }
            }
            delete data.subTypeId
            delete data.orderSubTypeId
        }
        if (data.id && ident != 'update') delete data.id
        return ident != 'update' ? await prisma.order.create({ data }) : await prisma.order.update({ where: { id: data.id }, data })
    } catch (err) {
        throwError(err)
    }
}

const deleteData = async (id) => {
    try {
        return await prisma.order.update({ where: { id }, data: { deleted: true } })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll, createUpdate, getRelatedObjekWisata, deleteData }