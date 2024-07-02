const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")
const bcrypt = require('bcrypt')

const users = [
    {
        name: "admin",
        email: "admin1@gmail.com",
        role: "ADMIN",
        password: "password"
    },
    {
        name: "kasirpos",
        email: "cashierpos@gmail.com",
        role: "CASHIER",
        shownCategory: { id: [1, 2, 3] },
        password: "password"
    },
    {
        name: "kasirsuvenir",
        email: "cashiersuvenir@gmail.com",
        role: "CASHIER",
        shownCategory: { id: [7] },
        password: "password"
    },
    {
        name: "kasirfnb",
        email: "cashierfnb@gmail.com",
        role: "CASHIER",
        shownCategory: { id: [5, 6] },
        password: "password"
    },
    {
        name: "superadmin",
        email: "superadmin@gmail.com",
        role: "SUPER_ADMIN",
        password: "password"
    },
    {
        name: "curaweda",
        email: "curaweda@gmail.com",
        role: "CURAWEDA",
        password: "password"
    },
]

const userSeed = async () => {
    try {
        for (let user of users) {
            const salt = await bcrypt.genSalt()
            user.password = await bcrypt.hash(user.password, salt)
            await prisma.user.upsert({
                where: { email: user.email },
                create: user, update: user
            })
        }
    } catch (err) {
        throwError(err)
    }
}

module.exports = { userSeed }