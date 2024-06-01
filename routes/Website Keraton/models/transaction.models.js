const { throwError } = require("../../utils/helper")
const orderModel = require('../models/order.models')
const eventModel = require('../models/events.models')
const cartModel = require('../models/carts.model')
const { prisma } = require("../../utils/prisma")
const globalParamModel = require('../models/params.models')
const barcodeModel =  require('../models/barcode.model')

const isExist = async (id) => {
    try{
        return await prisma.detailTrans.findFirst({ where: { id } })
    }catch(err){
        throwError(err)
    }
}

const getAll = async (userId) => {
    try{
        console.log(userId)
        return await prisma.transaction.findMany({ ...(userId && {
            where: { userId }
        }), include: { detailTrans: { include: { order: true, event: true } } }, orderBy: { plannedDate: 'desc' }})
    }catch(err){
        throwError(err)
    }
}

const getOneTransaction = async (id) => {
    try{
        return await prisma.transaction.findFirstOrThrow({ where: { id }, include: { detailTrans: true }})
    }catch(err){
        throwError(err)
    }
}

const getOne = async (id) => {
    try{
        const data = await isExist(id)
        if(!data) throw Error('Id didnt exist')
        return data
    }catch(err){
        throwError(err)
    }
}

const createNew = async (data) => {
    let { user, carts, args } = data, payloads = [], tiketUses = 0
    try {
        if (carts.length < 1) throw Error('No Item to Checkout')
        if(user) args.userId = user.id
        args.total = cartModel.countTotal(carts)
        args.additionalFee = 0
        await globalParamModel.getOne({ identifier: process.env.TAX_PARAMS_IDENTIFIER }).then(param => {
            for(let paramData of Object.values(param.data)) args.additionalFee += paramData.price
        })
        const createdTransacation = await prisma.transaction.create({ data: { ...args } })
        for (let cart of carts) {
            if (cart.quantity < 1) continue
            switch (cart.type) {
                case "T":
                    cart.typeData = {
                        orderId: cart.id,
                    }
                    break;
                case "E":
                    cart.typeData = {
                        eventId: cart.id,
                    }
                    break;
                default:
                    break;
            }
            tiketUses += cart.quantity
            payloads.push({
                amount: cart.quantity,
                transactionId: createdTransacation.id,
                ...cart.typeData
            })
        }
        const detailData = createManyDetail(payloads)
        const plannedDate = new Date(createdTransacation.plannedDate);
        const expiredAt = new Date(plannedDate);
        expiredAt.setDate(expiredAt.getDate() + 1);
        
        await barcodeModel.create({
            uniqueId: createdTransacation.id,
            remainingUses: tiketUses,
            expiredAt, detailData
        })
        return { createdTransacation, detailData }
    } catch (err) {
        throwError(err)
    }
}

const createManyDetail = async (datas = [{ amount, transactionId, orderId, eventId, guideId }]) => {
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
    try{
        return await prisma.transaction.update({ where: { id }, data })
    }catch(err){
        throwError(err)
    }
}

module.exports = { createNew, createDetail, createManyDetail, getOne, getAll, getOneTransaction, update }