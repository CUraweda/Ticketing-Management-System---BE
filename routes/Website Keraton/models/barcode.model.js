const { throwError, shaHash256 } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const QrGenerator = require("../../utils/qr")
const qrClass = new QrGenerator()

const create = async (data = { uniqueId, remainingUses, expiredAt }) => {
    try {
        const createdQR = qrClass.create(data)
        return await prisma.barcodeUsage.create({ data: { id: data.uniqueId, remainingUses: data.remainingUses, qrPath: createdQR, expiredAt: data.expiredAt } })
    } catch (err) {
        throwError(err)
    }
}

const isExist = async  (id) => {
    try{
        return await prisma.barcodeUsage.findFirstOrThrow({where: { id } })
    }catch(err){
        throwError(err)
    }
}

const update = async (id, data) => {
    try{
        return await prisma.barcodeUsage.update({ where: { id }, data })
    }catch(err){
        throwError(err)
    }
}

module.exports = { create }