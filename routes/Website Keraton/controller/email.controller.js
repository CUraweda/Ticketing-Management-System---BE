var express = require("express");
var router = express.Router();
const path = require('path')
const Email = require('../emails/email');
const { error, success } = require("../../utils/response");
const { userInfo } = require("os");
const { splitDate } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const emailClass = new Email()

router.get('/render', async (req, res) => {
    try {
        res.render(path.resolve('routes/Website Keraton/emails/templates/invoice'), {
            email: "steve@gmail.com",
            name: "Steve",
            date: new Date().toLocaleDateString(),
            imageAttachment: '/public/assets/email/testqr.jpg',
            nomor_invoice: 109109019020,
            method: "method",
            invoices: [
                {
                    item_desc: "test",
                    quantity: "20",
                    price: "200",
                    total: "test",
                },
                {
                    item_desc: "test",
                    quantity: "test",
                    price: "test",
                    total: "test",
                }
            ],
            subtotal: 2000,
            tax: 1000,
            total: 3000
        })
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/invoice/:id', async (req, res) => {
    try {
        const transactionExist = await prisma.transaction.findFirstOrThrow({ where: { id: req.params.id }, include: { user: true, detailTrans: { include: { order: true, event: true } } } })
        if (!transactionExist) throw Error('Transaction Didnt Exist')
        const emailClass = new Email(process.env.EMAIL_FROM, "nadifdzaikra@gmail.com", "Test")
        await emailClass.sendEmailTemplate(
            {
                email: transactionExist.user.email,
                name: transactionExist.user.name,
                date: transactionExist.plannedDate.toLocaleDateString(),
                nomor_invoice: transactionExist.id,
                method: transactionExist.method,
                invoices: transactionExist.detailTrans.map(detail => ({
                    item_desc: detail.order.desc,
                    quantity: detail.amount,
                    price: detail.orderId ? detail.order.price : detail.event.price,
                    total: detail.amount * (detail.orderId ? detail.order.price : detail.event.price),
                })),
                subtotal: parseFloat(transactionExist.total).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                }),
                tax: parseFloat(transactionExist.additionalFee).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                }),
                total: (parseFloat(transactionExist.total) + parseFloat(transactionExist.additionalFee)).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR"
                })
            },
            [
                "public/assets/email/testqr.jpg",
                "public/assets/email/logo.jpg",
            ]
        )
        return success(res, "Email terkirim", 201)
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router