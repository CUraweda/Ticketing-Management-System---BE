const { prisma } = require("../../routes/utils/prisma")

const params = [
    {
        identifier: "KeratonAppTax",
        data: {
            cash: [
                {
                    label: "Biaya Curaweda",
                    tax: 1500,
                    multiply: false,
                    paidBy: "keraton"
                }
            ],
            nonCash: [
                {
                    label: "Biaya Layanan",
                    tax:  0.015,
                    multiply: true,
                    paidBy: "user"
                }
            ]
        }
    }
]

const paramSeed = async() => {
    return await prisma.globalParam.createMany({ data: params })
}

module.exports = { paramSeed }
