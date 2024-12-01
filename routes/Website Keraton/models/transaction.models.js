const { throwError, localNationality } = require("../../utils/helper")
const cartModel = require('../models/carts.model')
const { prisma } = require("../../utils/prisma")
const globalParamModel = require('../models/params.models')
const barcodeModel = require('../models/barcode.model')
const discountModel = require('../models/discount.models')

const isExist = async (id) => {
    try {
        return await prisma.detailTrans.findFirst({ where: { id } })
    } catch (err) {
        throwError(err)
    }
}

const getAll = async (userId, args) => {
    const { s, d, stat } = args
    let rawDate
    if (d) rawDate = d.split('T')[0]
    try {
        return await prisma.transaction.findMany({
            ...(userId && {
                where: {
                    userId,
                    deleted: false,
                    ...(s && {
                        detailTrans: {
                            some: {
                                OR: [
                                    { order: { name: { contains: s } } },
                                    { event: { name: { contains: s } } },
                                ]
                            }
                        }
                    }),
                    ...(d && {
                        plannedDate: {
                            lte: `${rawDate}T23:59:59.999Z`,
                            gte: `${rawDate}T00:00:00.000Z`
                        }
                    }),
                    ...(stat && { status: stat })
                }
            }), include: { detailTrans: { include: { order: true, event: true } }, BarcodeUsage: true }, orderBy: { createdDate: 'desc' }
        })
    } catch (err) {
        throwError(err)
    }
}

const getOneTransaction = async (id) => {
    try {
        return await prisma.transaction.findFirstOrThrow({ where: { id, deleted: false }, include: { detailTrans: true } })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try {
        const data = await isExist(id)
        if (!data) throw Error('Id didnt exist')
        return data
    } catch (err) {
        throwError(err)
    }
}

const createNew = async (data) => {
    let { user, carts, args } = data, payloads = [], tiketUses = 0, revenueKeraton = { COH: 0, CIA: 0 }, revenueCuraweda = { COH: 0, CIA: 0 }, paramRevenueMethod, paramTax, countryReference = {}
    const taxParam = await globalParamModel.getOne({ identifier: process.env.TAX_PARAMS_IDENTIFIER })
    try {
        if (carts.length < 1) throw Error('No Item to Checkout')
        if (user) args.user = { connect: { id: user.id } }
        args.total = cartModel.countTotal(carts)
        for (let cart of carts) {
            if (cart.quantity < 1) continue
            switch (cart.type) {
                case "T":
                    cart.typeData = {
                        orderId: cart.id,
                    }
                    tiketUses += cart.minimumUnit ? cart.minimumUnit * cart.quantity : cart.quantity
                    break;
                case "E":
                    cart.typeData = {
                        eventId: cart.id,
                    }
                    tiketUses += cart.quantity
                    break;
                default:
                    break;
            }
            payloads.push({
                amount: cart.quantity,
                ...(cart.nationalityId && { nationalityId: localNationality.readPropertiesData(cart.nationalityId) }),
                ...(cart.cityName && { cityName: cart.cityName }),
                ...cart.typeData
            })
        }

        args.paidTotal = args.total
        // Discount Code
        if(args.discountCode) {
            const discountData = await discountModel.getByCode(args.discountCode)
            if(discountData) {
                args.paidTotal -= discountData.discount_price
                args.discountCode = discountData.code
                args.discountCutTotal = discountData.discount_price
            }
        }
        
        if(args.paidTotal < 0) args.paidTotal = 0
        // Payment Percentage
        if(args.payPercentage && args.payPercentage <= 100 && args.paidTotal != 0) {
            const percentageTotal = args.paidTotal * args.payPercentage / 100
            args.unpaidTotal = args.paidTotal - percentageTotal
            args.paidTotal = percentageTotal
        }

        // PAYMENT METHOD
        switch (data.method) {
            case "CASH":
                paramRevenueMethod = 'COH'
                paramTax = 'cash'
                break;
            default:
                paramRevenueMethod = 'CIA'
                paramTax = 'nonCash'
                break;
        }

        let totalTax = 0

        // TAXES
        taxParam.data[paramTax].forEach((param) => {
            const totalRawTax = param.multiply ? args.total * param.tax : param.tax
            totalTax += totalRawTax
            revenueKeraton[paramRevenueMethod] = args.paidTotal
            switch (param.paidBy) {
                case "user":
                    args.paidTotal += totalRawTax
                    revenueCuraweda[paramRevenueMethod] += totalRawTax
                    break;
                case "keraton":
                    revenueKeraton[paramRevenueMethod] = revenueKeraton[paramRevenueMethod] - totalRawTax
                    revenueCuraweda[paramRevenueMethod] += totalRawTax
                    break;
            }
        })

        args.additionalFee = totalTax
        args.keratonIncome = revenueKeraton
        args.curawedaIncome = revenueCuraweda
        const createdTransacation = await prisma.transaction.create({ data: { ...args } })

        const plannedDate = new Date(createdTransacation.plannedDate);
        const expiredAt = new Date(plannedDate);
        expiredAt.setDate(expiredAt.getDate() + 1);
        await barcodeModel.create({
            uniqueId: createdTransacation.id,
            possibleUses: tiketUses,
            expiredAt
        })
        payloads = payloads.map((data) => ({
            ...data,
            transactionId: createdTransacation.id
        }))
        const detailData = createManyDetail(payloads)
        return { createdTransacation, detailData }
    } catch (err) {
        throwError(err)
    }
}

const createManyDetail = async (datas = [{ amount, transactionId, orderId, eventId, guideId, nationalityId, cityName }]) => {
    try {
        return await prisma.detailTrans.createMany({ data: datas })
    } catch (err) {
        throwError(err)
    }
}

const createDetail = async (data) => {
    try {
        return await prisma.detailTrans.create({ data })
    } catch (err) {
        throwError(err)
    }
}

const update = async (id, data) => {
    try {
        return await prisma.transaction.update({ where: { id }, data })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { createNew, createDetail, createManyDetail, getOne, getAll, getOneTransaction, update }