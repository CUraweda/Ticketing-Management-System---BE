const { z } = require('zod')

const paymentValidator = {
    createQris: z.object({
        username: z.string(),
        email: z.string(),
        paymentType: z.string().default("QRIS"),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(value => parseFloat(value).toFixed(2)),
        productName: z.string(),
        productInfo: z.object({
            id: z.string(),
            name: z.string()
        }),
        appUrl: z.string()
    }),
    createVa: z.object({
        username: z.string(),
        email: z.string(),
        paymentType: z.string(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(value => parseFloat(value).toFixed(2)),
        payer: z.string(),
        productName: z.string(),
        productInfo: z.object({
            id: z.string(),
            name: z.string()
        }),
        appUrl: z.string()
    }),
    inquiryQris: z.object({
        merchantTradeNo: z.string(),
        paymentType: z.string().default("QRIS")
    }),
    inquiryVa: z.object({
        customerNo: z.string(),
        virtualAccountNo: z.string()
    }),
    cancelQris: z.object({
        merchantTradeNo: z.string(),
        platformTradeNo: z.string()
    }),
    updateVa: z.object({
        customerNo: z.string(),
        virtualAccountNo: z.string(),
        virtualAccountName: z.string().optional(),
        virtualAccountEmail: z.string().email().optional(),
        virtualAccountPhone: z.string().optional(),
        trxId: z.string(),
        totalAmount: z.object({
            value: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(value => parseFloat(value).toFixed(2)),
            currency: z.string().default("IDR")
        }),
        billDetails: z.object({
            billCode: z.string(),
            billName: z.string()
        })
    })
};

module.exports = paymentValidator