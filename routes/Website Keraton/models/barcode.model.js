const { throwError, shaHash256 } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const QrGenerator = require("../../utils/qr")
const qrClass = new QrGenerator()

const create = async (data = { uniqueId, remainingUses }) => {
    try{
        const createdQR = qrClass.create(data)
        return await prisma.barcodeUsage.create({ data: { remainingUses: data.remainingUses, qrPath: createdQR } })
    }catch(err){
        throwError(err)
    }
}

module.exports = { create }