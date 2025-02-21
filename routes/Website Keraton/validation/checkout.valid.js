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
    }),
    discount_code: z.string().default(""),
    // pay_percentage: z.number().int().default(100)
})

const validateCheckoutJanji = validate({
    temp_cart: z.any(),
    temp_user_data: z.object({
        availabilityId: z.number({ required_error: "Availability ID is required" }).int(),
        booker_name: z.string({ required_error: "Booker Name is required" }),
        booker_email: z.string({ required_error: "Booker Email is required" }),
        booker_phone: z.string({ required_error: "Booker Phone is required" }),
        datetime: z.string({ required_error: "Datetime is required" }),
    }),
    method: z.string({
        required_error: "Transaction Method is required",
    }),
    discount_code: z.string().default(""),
    // pay_percentage: z.number().int().default(100)
})

module.exports = { validateCheckout, validateCheckoutJanji }