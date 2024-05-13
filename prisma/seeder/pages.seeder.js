const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")

const pages = [
    'Beranda',
    'Keraton',
    'Silsilah',
    'Objek Wisata Utama',
    'Objek Wisata',
    'Paket Keraton',
    'Tiket Event'
]

const pageSeed = async () => {
    try {
        for (let page of pages) {
            await prisma.pages.upsert({
                where: { name: page },
                create: { name: page}, update: { name: page }
            })
        }
    } catch (err) {
        throwError(err)
    }
}

module.exports = { pageSeed }