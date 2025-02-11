
const { PrismaClient } = require('@prisma/client')
const { createPayment } = require('./middleware/prisma/extends-transaction')
const prisma = new PrismaClient().$extends({
    query: {
        transaction: {
            create: createPayment
        }
    }
})

module.exports = { prisma }