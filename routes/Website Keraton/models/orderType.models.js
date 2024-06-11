const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const isExist = async (id) => {
    try {
        return await prisma.orderType.findFirst({ where: { id } })
    } catch (err) {
        throwError(err)
    }
}

const nameExist = async (name) => {
    try {
        return await prisma.orderType.findFirst({ where: { name } })
    } catch (err) {
        throwError(err)
    }
}

const getAll = async () => {
    try {
        return await prisma.orderType.findMany({
            where: { disabled: false },
            include: { orderSubType: true }
        })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try {
        return await prisma.orderType.findFirstOrThrow({
            where: { id }, include: { orderSubType: true }
        })
    } catch (err) {
        throwError(err)
    }
}

const createUpdate = async (ident, data = { name, id }) => {
    try {
        const alreadyExist = await nameExist(data.name)
        if (ident != 'create') if (alreadyExist) throw Error('Type name already exist')
        if (alreadyExist && alreadyExist.disabled) data.disabled = false
        return await prisma.orderType.upsert({
            where: { ...(data.id ? { id: data.id } : { name: data.name }) },
            create: data, update: data
        })
    } catch (err) {
        throwError(err)
    }
}

const deleteSoft = async (id) => {
    try {
        return await prisma.orderType.update({ where: { id }, data: { disabled: true } })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll, createUpdate, deleteSoft }