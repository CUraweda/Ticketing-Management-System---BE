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
    const detailTransactions = await detailTransModel.getFromOrderId(order.id);
    if (detailTransactions) {
      for (const detailTrans of detailTransactions) {
        const transactions = await transactionModel.getAll(
          detailTrans.transactionId
        );
        for (const transaction of transactions) {
          await transactionModel.updateTransData(
            transaction,
            order,
            detailTrans
          );
          const deletedDetails = await detailTransModel.deleteDetailTrans(
            detailTrans.id
          );
          await relationLogs(deletedDetails, order);
          if (transaction.total <= Number(transaction.additionalFee + 1)) {
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
      }
    }
    await prisma.order
      .delete({ where: { id: id } })
      .then(
        await logsModel.logDelete(
          `Menghapus pesanan ${order.name} (${order.category.name}) dengan ID ${order.id}.`,
          "Order",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logDelete(`Menghapus pesanan ${id}.`, "Order", "Failed");
    throwError(err);
  }
};
const relationLogs = async (deletedDetails, order) => {
  try {
    for (const detail of deletedDetails) {
      await logsModel.logDelete(
        `Menghapus detail transaksi ${detail.id} yang memiliki kaitan dengan pesanan ${order.name}.`,
        "Detail Transaction",
        "Success"
      );
    }
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  deleteOrder,
};
