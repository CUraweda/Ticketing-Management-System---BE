const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const logsModel = require('../../Keraton PoS/models/logs.models')

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
        }).then(async (dbData) => { ident != 'create' ? await logsModel.logUpdate(`Mengubah tipe pesanan ${dbData.name}`, "Order Type", "Success") : await logsModel.logCreate(`Membuat tipe pesanan baru ${dbData.name}`, "Order Type", "Success") })
    } catch (err) {
        console.log(err)
        ident != 'create' ? await logsModel.logUpdate(`Mengubah tipe pesanan ${data.name} menjadi ${data.name}`, "Order Type", "Success") : await logsModel.logCreate(`Membuat tipe pesanan baru ${data.name}`, "Order Type", "Success")
        throwError(err)
    }
}

const deleteSoft = async (id) => {
    try {
        return await prisma.orderType.update({ where: { id }, data: { disabled: true } }).then(async (data) => {
            await logsModel.logDelete(`Menghapus tipe pesanan ${data.name}`, "Order Type", "Success")
        })
    } catch (err) {
        await logsModel.logDelete(`Menghapus tipe pesanan ID : ${id}`, "Order Type", "Failed")
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll, createUpdate, deleteSoft }