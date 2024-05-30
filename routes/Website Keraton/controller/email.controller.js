var express = require("express");
var router = express.Router();
const path = require('path')
const Email = require('../emails/email');
require('dotenv').config()
const { error } = require("../../utils/response");
const transactionModel = require('../models/transaction.models');
const { prisma } = require("../../utils/prisma");

router.get('/render', async (req, res) => {
    try {
        res.render(path.resolve('routes/Website Keraton/emails/templates/invoice'), {
            email: "Email Here",
            name: "Name Here"
        })
    } catch (err) {
        return error(res, err.message)
    }
})

router.post('/invoice/:id', async (req, res) => {
    try {
        const transactionExist = await prisma.transaction.findFirstOrThrow({ where: { id: req.params.id } })
        if (!transactionExist) throw Error('Transaction Didnt Exist')
        const emailClass = new Email(process.env.EMAIL_FROM, )
        emailClass.sendEmailTemplate()
    } catch (err) {
        return error(res, err.message)
    }
})

module.exports = router