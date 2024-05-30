const { z } = require('zod');
const validate = require('./validation');

const validateCreateReservation = validate({
    email: z.string({
    }),
    password: z.string({
        required_error: "Please send password"
    }),
})

module.exports = { validateCreateReservation }