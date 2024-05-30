const { prisma } = require("../../routes/utils/prisma")

const params = [
    {
        identifier: "KeratonAppTax",
        data: {
            biayaLayanan: {
                label: "Biaya Layanan",
                price: 2500
            },
            biayaJasaAplikasi: {
                label: "Biaya Jasa Aplikasi",
                price: 1000
            }
        }
    }
]

const paramSeed = async() => {
    return await prisma.globalParam.createMany({ data: params })
}

module.exports = { paramSeed }
