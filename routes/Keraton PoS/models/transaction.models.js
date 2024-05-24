const { throwError, startDate, endDate } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");

const getOne = async (id) => {
  try {
    return await prisma.transaction.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getRevenue = async () => {
  try {
    const transaction = await prisma.transaction.findMany({
      where: { createdDate: { gte: startDate, lte: endDate } },
    });
    const total = parseInt(
      transaction.reduce((acc, curr) => acc + parseInt(curr.total), 0)
    );
    return total;
  } catch (err) {
    throwError(err);
  }
};
const updateTransData = async (
  transaction = [],
  order = [],
  detailTrans = []
) => {
  try {
    const data = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        total: (transaction.total -=
          order.price * detailTrans.amount + 3500 - transaction.discount),
      },
    });
    await logsModel.logUpdate(
      `Mengubah total transaksi ${transaction.id}`,
      "Transaction",
      "Success"
    );
    return data;
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah total transaksi ${transaction.id}`,
      "Transaction",
      "Failed"
    );
    throwError(err);
  }
};
const getDistinctDate = async () => {
  try {
    return await prisma.transaction.findMany({ distinct: ["createdDate"] });
  } catch (err) {
    throwError(err);
  }
};
const getYear = async () => {
  try {
    const distinct = await getDistinctDate();
    const years = distinct.map((transaction) => {
      return new Date(transaction.createdDate).getFullYear();
    });
    const data = [...new Set(years)];
    return data;
  } catch (err) {
    throwError(err);
  }
};
const getMonth = async () => {
  try {
    const distinct = await getDistinctDate();
    const months = distinct.map((transaction) => {
      return new Date(transaction.createdDate).getMonth() + 1;
    });
    const data = [...new Set(months)];
    return data;
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    const order = data.order;
    delete data.order;

    const transaction = await prisma.transaction.create({
      data: data,
    });
    await logsModel.logCreate(
      `Membuat transaksi ${transaction.id}`,
      "Transaction",
      "Success"
    );
    await createDetail(order, transaction);
    return transaction.id
  } catch (err) {
    await logsModel.logCreate(`Membuat transaksi`, "Transaction", "Failed");
    throwError(err);
  }
};
const createDetail = async (order, transaction) => {
  try {
    for (const o of order) {
      const data = await prisma.detailTrans.create({
        data: {
          amount: o.amount,
          transaction: {
            connect: {
              id: transaction.id,
            },
          },
          guide: o.guideId
            ? {
                connect: {
                  id: o.guideId,
                },
              }
            : {},
          order: {
            connect: {
              id: o.id,
            },
          },
        },
      });
      await logsModel.logCreate(
        `Membuat detail transaksi ${data.id}`,
        "DetailTrans",
        "Success"
      );
    }
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  getOne,
  getRevenue,
  getYear,
  getMonth,
  updateTransData,
  create,
};
