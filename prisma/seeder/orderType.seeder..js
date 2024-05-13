const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")

const types = [
    'Tiket',
    'Paket'
]

const typeSeed = async () => {
    try{
        for(let type of types){
            await prisma.orderType.upsert({
                where: { name: type },
                create: { name: type }, update: { name: type }
            })
        }
    }catch(err){
        throwError(err)
    }
} 

module.exports = { typeSeed }