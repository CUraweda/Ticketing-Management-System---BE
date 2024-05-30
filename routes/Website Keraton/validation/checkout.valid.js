const { z } = require('zod');
const validate = require('./validation');

const validateCheckout = validate({
    plannedDate: z.string({
        required_error: "Date is required",
    }).datetime(),
    method: z.string({
        required_error: "Transaction Method is required",
    }),
    carts: z.any({
        required_error: "Carts is required"
    })
})

module.exports = { validateCheckout }