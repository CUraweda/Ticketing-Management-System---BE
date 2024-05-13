const { writeLog, throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const detailTransModel = require("./detailTrans.models");
const transactionModel = require("./transaction.models");

const isExist = async (id) => {
  try {
    return await prisma.order.findFirst({
      where: { id: id },
      include: { category: true },
    });
  } catch (err) {
    throwError(err);
  }
};

const deleteOrder = async (id) => {
  try {
    const order = await isExist(id);
    if (!order) throw Error("Order ID tidak ditemukan");
    const detailTrans = await detailTransModel.getFromOrderId(order.id);
    if (detailTrans) {
      const transaction = await transactionModel.getOne(
        detailTrans.transactionID
      );
      await transactionModel.updateTransData(transaction, order, detailTrans);
      const deletedDetails = await detailTransModel.deleteDetailTrans(
        detailTrans.id
      );
      for (const detail of deletedDetails) {
        writeLog(
          `Detail transaksi dengan ID ${detail.id} yang memiliki kaitan dengan pesanan ${order.name} berhasil dihapus.`
        );
      }
      if (transaction.total < 1) {
        await prisma.transaction.delete({
          where: { id: transaction.id },
        });
        writeLog(
          `Transaksi dengan ID ${transaction.id} juga dihapus karena nilai totalnya kosong.`
        );
      }
    }
    writeLog(
      `Pesanan ${order.name} (${order.category.name}) dengan ID ${order.id} berhasil dihapus.`
    );
    return await prisma.order.delete({ where: { id } });
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  deleteOrder,
};
