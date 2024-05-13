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
        const nameExist = await prisma.orderType.findFirst({ where: { name } })
        return (nameExist != null)
    } catch (err) {
        throwError(err)
    }
}

const getAll = async () => {
    try {
        return await prisma.orderType.findMany({
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

const createUpdate = async (ident, data = { name , id}) => {
    try {
        if(ident != 'edit'){
            const alreadyExist = await nameExist(data.name)
            if (alreadyExist) throw Error('Type name already exist')
        }
        return await prisma.orderType.upsert({
            where: { name: data.name },
            create: data, update: data
        })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll, createUpdate }