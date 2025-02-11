const { throwError } = require("../utils/helper")
const PaymentHelper = require("../utils/payment/payment")
const { prisma } = require("../utils/prisma")
const paymentHelper = new PaymentHelper()

const notify = async (id, args = {}) => {
    const { status } = args

    console.log(id, args)
    id = paymentHelper._decryptTID(id)
    console.log(id)
    const transactionData = await prisma.transaction.findFirst({ where: { id } })
    if (!transactionData) throw Error("Couldn't find transaction data")

    let updateData = {}
    switch (status) {
        case 'SUCCESS':
            updateData['transaction'] = {
                paidTotal: (transactionData.total - transactionData.discountCutTotal - transactionData.additionalFee),
                status: 'DAPAT_DIGUNAKAN',
            };
            break;
        case 'FAILED':
            updateData['transaction'] = { isPaid: false, status: 'Gagal' };
            break;
        default:
            updateData['transaction'] = { isPaid: false, status: 'Gagal' };
            break;
    }

    const updatedData = await prisma.transaction.update({ where: { id }, data: updateData['transaction'] })
    if (!updatedData) throw new Error("Fail to update transaction data")

    return updatedData
}

module.exports = { notify }