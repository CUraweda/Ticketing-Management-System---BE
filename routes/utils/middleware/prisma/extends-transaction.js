const { PrismaClient } = require("@prisma/client");
const PaymentHelper = require("../../payment/payment.js");

const pHelper = new PaymentHelper()


const createPayment = async ({ args, query }) => {
    const prisma = new PrismaClient()
    let { userData, paidTotal, method, ...rest } = args.data;

    const result = await query({
        data: {
            ...rest, method,
            paidTotal: 0
        }
    })

    if (!result) throw Error("Error while creating transaction")

    const paymentData = await pHelper.create({
        paymentType: method,
        transactionId: result.id,
        data: {
            total: paidTotal,
            user: userData
        },
        payer: userData.name
    })
    if (!paymentData) throw Error("Error on Payment Server, please contact admin")

    return await prisma.transaction.update({
        where: { id: result.id },
        data: {
            ...rest, method,
            paidTotal: 0,
            merchantTradeNo: paymentData?.merchantTradeNo,
            platformTradeNo: paymentData?.platformTradeNo,
            qrisLink: paymentData?.qrisUrl,
            customerNo: paymentData?.virtualAccountData?.customerNo,
            virtualAccountNo: paymentData?.vaCode,
            expiredDate: paymentData.expiredDate,
        }
    });
};

module.exports = { createPayment }