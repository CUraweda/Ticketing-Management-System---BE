const { z } = require('zod');
const validate = require('./validation');

const createUpdateValidation = validate({
    discount_price: z.number({
        required_error: "Please send discount price"
    }),
    code: z.string({
        required_error: "Please send discount code"
    }),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
    is_deleted: z.boolean().default(false),
})


module.exports = { createUpdateValidation }