const { throwError, shaHash256 } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const QrGenerator = require("../../utils/qr")
const qrClass = new QrGenerator()
const path = require("path");


function convertFilesToURL(filePath) {
    const baseURL = "http://localhost:3000";
    return baseURL + filePath.replace("public", "").split(path.sep).join("/");
  }
  

const create = async (data = { uniqueId, remainingUses, expiredAt }) => {
    try {
        const createdQR = qrClass.create(data)
        return await prisma.barcodeUsage.create({ data: { 
            id: data.uniqueId, 
            transactionId: data.uniqueId, 
            remainingUses: data.remainingUses, 
            qrPath: convertFilesToURL(createdQR), 
            expiredAt: data.expiredAt 
        } })
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

const use = async (id) => {
    try{
        const transaction = await prisma.barcodeUsage.findFirst({ where: { id }, include: { transaction: true } })
        if(transaction.transaction) ''
    }catch(err){
        throwError(err)
    }
} 

module.exports = { create, isExist, update }