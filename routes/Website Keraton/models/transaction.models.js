const { throwError } = require("../../utils/helper")
const orderModel = require('../models/order.models')
const eventModel = require('../models/events.models')
const cartModel = require('../models/carts.model')
const { prisma } = require("../../utils/prisma")

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
    let { user, carts, args } = data, payloads = []
    try {
        if (carts.length < 1) throw Error('No Item to Checkout')
        if(user){
            args.custName = user.name
            args.custEmail =user.email
            args.userId = user.id
            if(user.number) args.custNumber = user.number
        }
        args.total = cartModel.countTotal(carts)
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
            payloads.push({
                amount: cart.quantity,
                transactionId: createdTransacation.id,
                ...cart.typeData
            })
        }
        const detailData = createManyDetail(payloads)
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

module.exports = { createNew, createDetail, createManyDetail, getOne, getAll }