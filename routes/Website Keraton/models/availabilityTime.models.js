const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const isExist = async (id) => {
    return await prisma.availabilityTime.findFirst({ where: { id } })
}

const checkAvailability = async (id) => {
    return await prisma.availabilityTime.findFirst({ where: { id, in_use: false, disabled: false } })
}
const getAll = async (query) => {
    const { month, year } = query
    try {
        let startDate, endDate
        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of the month
        }

        return await prisma.availabilityTime.findMany({
            where: {
                disabled: false,
                ...(startDate && { datetime: { gte: startDate, lte: endDate } })
            },
        })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try {
        const exist = await isExist(id)
        if (exist) return exist
    } catch (err) {
        throwError(err)
    }
}

const create = async (data) => {
    try {
        return await prisma.availabilityTime.create({ data })
    } catch (err) {
        throwError(err)
    }
}

const update = async (id, data) => {
    try {
        const exist = await isExist(id)
        if (!exist) throw Error('Availability Time didnt exist')
        return await prisma.availabilityTime.update({ where: { id }, data })
    } catch (err) {
        throwError(err)
    }
}

const deleteSoft = async (id) => {
    try {
        return await prisma.availabilityTime.update({ where: { id }, data: { disabled: true } })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { getAll, getOne, create, update, isExist, deleteSoft, checkAvailability }