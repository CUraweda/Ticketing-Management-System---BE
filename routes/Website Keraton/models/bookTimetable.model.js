const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const availabilityTimeModel = require('./availabilityTime.models')

const isExist = async (id) => {
    return await prisma.bookTimetable.findFirst({ where: { id } })
}
const getAll = async (query) => {
    const { month, year } = query
    try {
        let startDate, endDate
        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of the month
        }

        return await prisma.bookTimetable.findMany({
            where: {
                disabled: false,
                ...(startDate && {
                    availability: {
                        datetime: { gte: startDate, lte: endDate }
                    }
                })
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
        if (!data.availabilityId) throw Error("Availability ID is needed")
        const timeIsAvailable = await availabilityTimeModel.checkAvailability(data.availabilityId)
        if (!timeIsAvailable) throw Error("Time is already used")
        await availabilityTimeModel.update(data.availabilityId, { in_use: true })
        return await prisma.bookTimetable.create({ data })
    } catch (err) {
        throwError(err)
    }
}

const update = async (id, data) => {
    try {
        const exist = await isExist(id)
        if (!exist) throw Error('Book Timetable didnt exist')
        if (data.availabilityId) {
            const timeIsAvailable = await availabilityTimeModel.checkAvailability(data.availabilityId)
            if (!timeIsAvailable) throw Error("Time is already used")
            await availabilityTimeModel.update(data.availabilityId, { in_use: true })
        }
        return await prisma.bookTimetable.update({ where: { id }, data })
    } catch (err) {
        throwError(err)
    }
}

const deleteSoft = async (id) => {
    try {
        const softDeleteBookTime = await prisma.bookTimetable.update({ where: { id }, data: { disabled: true } })
        if(!softDeleteBookTime) throw Error("Booking unsuccessfully deleted")
        availabilityTimeModel.update(softDeleteBookTime.availabilityId, { in_use: false })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { getAll, getOne, create, update, isExist, deleteSoft }