const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")

const iterats = [
   'Perminggu',
   'Perbulan',
   'Pertahun'
]

const iterationSeed = async () => {
    try {
        for (let iterat of iterats) {
            await prisma.eventIteration.upsert({
                where: { name: iterat },
                create: { name: iterat}, update: { name: iterat }
            })
        }
    } catch (err) {
        throwError(err)
    }
}

module.exports = { iterationSeed }