const { throwError, shaHash256 } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const QrGenerator = require("../../utils/qr")
const qrClass = new QrGenerator()
const path = require("path");

function convertFilesToURL(filePath) {
    const baseURL = `${process.env.BASE_URL}`;
    return baseURL + filePath.replace("public", "").split(path.sep).join("/");
}


const create = async (data = { uniqueId, possibleUses, expiredAt }) => {
    try {
        const createdQR = qrClass.create(data)
        return await prisma.barcodeUsage.create({
            data: {
                id: data.uniqueId,
                transactionId: data.uniqueId,
                remainingUses: data.possibleUses,
                qrPath: convertFilesToURL(createdQR),
                expiredAt: data.expiredAt
            }
        })
    } catch (err) {
        throwError(err)
    }
}

const isExist = async (id) => {
    try {
        return await prisma.barcodeUsage.findFirstOrThrow({ where: { id }, include: { transaction: true } })
    } catch (err) {
        throwError(err)
    }
}

const update = async (id, data) => {
    try {
        return await prisma.barcodeUsage.update({ where: { id }, data })
    } catch (err) {
        throwError(err)
    }
}

const deleteData = async (id) => {
    try {
        return await prisma.barcodeUsage.delete({ where: { id } })
    } catch (err) {
        throwError(err)
    }
}

const use = async (id) => {
    try {
        const currentDate = new Date()
        const barcode = await prisma.barcodeUsage.findFirst({ where: { id }, include: { transaction: true } })
        if (barcode.transaction.plannedDate) {
            const plannedDate = new Date(barcode.transaction.plannedDate)
            if (currentDate > plannedDate) {
                await deleteData(barcode.id)
                // await transactionModel.update(barcode.transactionId, { status: "SUDAH_DIGUNAKAN" })
                throw Error('Tiket expires')
            }
        }
        if (barcode.remainingUses < 1) throw Error('Sorry tiket cannot be used again')
        barcode.remainingUses -= 1
        // if(barcode.remainingUses < 1) await transcationModel.update(barcode.transactionId, { status: "SUDAH_DIGUNAKAN" })
        delete barcode.transaction
        delete barcode.id
        delete barcode.createdAt
        return await prisma.barcodeUsage.update({ where: { id }, data: barcode })
    } catch (err) {
        throwError(err)
    }
}

module.exports = { create, isExist, update, use }