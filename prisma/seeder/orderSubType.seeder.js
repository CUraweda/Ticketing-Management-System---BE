const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")

const subTypes = [
    {
        name: "Tiket Masuk",
        orderTypeId: 1,
    },
    {
        name: "Paket Silaturahmi",
        orderTypeId: 2,
    },
    {
        name: "Paket Non Silaturahmi",
        orderTypeId: 2,
    },
]

const subTypeSeed = async () => {
    try{
        for(let subType of subTypes){
            await prisma.orderSubType.upsert({
                where: { name: subType.name },
                create: subType, update: subType
            })
        }        
    }catch(err){
        throwError(err)
    }
}

module.exports = { subTypeSeed }