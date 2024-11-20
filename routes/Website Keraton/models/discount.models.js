const { name } = require("ejs")
const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const isExist = async (id) => {
    try {
        return await prisma.discount.findFirst({ where: { id } })
    } catch (err) {
        throwError(err)
    }
}

const getAll = async (query) => {
    try {
        return await prisma.discount.findMany({
            where: { is_deleted: false }
        })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try {
        return await prisma.discount.findFirstOrThrow({
            where: { id, is_deleted: false }
        })
    } catch (err) {
        throwError(err)
    }
}

const getByCode = async (code) => {
    try {
        return await prisma.discount.findFirst({ where: { code } })
    } catch (err) {
        throwError(err)
    }
}

const create = async (data) => {
    try {
        return await prisma.discount.create({ data })
    } catch (err) {
        throwError(err)
    }
}

const update = async (id, data) => {
    try {
        const exist = await isExist(id)
        if (!exist) throw Error('Discount Id didnt exist')
        return await prisma.discount.update({ where: { id }, data })
    } catch (err) {
        throwError(err)
    }
}

const deleteSoft = async (id) => {
    try {
        return await prisma.discount.update({ where: { id }, data: { is_deleted: true } })
    } catch (err) {
        throwError(err)
    }
}


module.exports = { isExist, getByCode, getOne, getAll, create, update, deleteSoft }