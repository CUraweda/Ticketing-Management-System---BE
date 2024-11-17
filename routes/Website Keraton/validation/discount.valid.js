const { z } = require('zod');
const validate = require('./validation');

const createUpdateValidation = validate({
    discount_price: z.number({
        required_error: "Please send discount price"
    }),
    code: z.string({
        required_error: "Please send discount code"
    }).parseAsync((data) => { console.log(data) }),
    description: z.string().optional(),
    is_active: z.string().default(true),
    description: z.string().default(false),
})


module.exports = { createUpdateValidation }