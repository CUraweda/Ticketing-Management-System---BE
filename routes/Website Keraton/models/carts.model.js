const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const userModel = require('./user.models')
const eventModel = require('./events.models')
const orderModel = require('./order.models')

const action = async (actionParam, id, carts) => {
    try {
        const user = await prisma.user.findFirst(id)
        let rawUserCarts = user.carts
        switch (actionParam) {
            case "add":
                for (let cart of carts) rawUserCarts[cart.id] = cart
                break;
            case "break":
                for (let cart of carts) delete rawUserCarts[cart.id]
                brea
            default:
                break
        }
        return await userModel.update(user.id, { carts: rawUserCarts })
    } catch (err) {
        throwError(err)
    }
}

const updateCart = async (id, carts) => {
    try {
        return await prisma.user.update({ where: { id }, data: { carts } })
    } catch (err) {
        throwError(err)
    }
}

const validate = async (carts) => {
    let dataToMatch = {}, checkedCart = []
    try {
        if (carts.length < 1) throw Error('No Item in carts')
        await (await prisma.order.findMany()).forEach(order => {
            dataToMatch["T"|order.id] = {
                image: order.image,
                price: order.price
            }
        })
        await (await prisma.events.findMany()).forEach(event => {
            dataToMatch["E|"+event.id] = {
                image: event.image,
                price: event.price
            }
        })
        for(let cart of carts){
            const itemIdentifier = `${cart.type}|${cart.id}`
            const itemExist = dataToMatch[itemIdentifier]
            if(!itemExist) continue
            cart.price = itemExist.price
            cart.image = itemExist.image
            checkedCart.push(cart)
        }
        return checkedCart
    } catch (err) {
        throwError(err)
    }
}

const updateCartData = async (carts) => {
    let dataExist
    try {
        for (let cart of carts) {
            switch (cart.type) {
                case "E":
                    dataExist = await eventModel.isExist(cart.id)
                    break;
                case "T":
                    dataExist = await orderModel.isExist(cart.id)
                    break;
                default:
                    break;
            }
            if (!dataExist) delete cart
            cart = {
                id: dataExist.id,
                name: dataExist.name,
                type: cart.type,
                image: cart.image,
                price: cart.price
            }
        }
        return carts
    } catch (err) {
        throwError(err)
    }
}

const countTotal = (carts) => {
    try {
        let total = 0

        for (let cart of carts) {
            console.log(cart)
            total = total + cart.price
        }
        console.log(total)
        return total
    } catch (err) {
        throwError(err)
    }
}

module.exports = { action, updateCart, countTotal, updateCartData, validate }