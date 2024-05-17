const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const detailTransModel = require("./detailTrans.models");
const transactionModel = require("./transaction.models");
const logsModel = require("./logs.models");

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
        detailTrans.transactionId
      );
      await transactionModel.updateTransData(transaction, order, detailTrans);
      const deletedDetails = await detailTransModel.deleteDetailTrans(
        detailTrans.id
      );
      for (const detail of deletedDetails) {
        await logsModel.logDelete(
          `Menghapus detail transaksi ${detail.id} yang memiliki kaitan dengan pesanan ${order.name}.`,
          "Detail Transaction",
          "Success"
        );
      }
      if (transaction.total < 1) {
        await prisma.transaction.delete({
          where: { id: transaction.id },
        });
        await logsModel.logDelete(
          `Menghapus tansaksi ${transaction.id} karena nilai totalnya kosong.`,
          "Transaction",
          "Success"
        );
      }
    }
    await logsModel.logDelete(
      `Menghapus pesanan ${order.name} (${order.category.name}) dengan ID ${order.id}.`,
      "Order",
      "Success"
    );
    return await prisma.order.delete({ where: { id } });
  } catch (err) {
    await logsModel.logDelete(
      `Menghapus pesanan ${id}.`,
      "Order",
      "Failed"
    );
    throwError(err);
  }
};

module.exports = {
  deleteOrder,
};
