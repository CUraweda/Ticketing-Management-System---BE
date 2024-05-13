const { throwError, startDate, endDate } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const userModel = require("./user.models");

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
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        total: (transaction.total -=
          order.price * detailTrans.amount + 3500 - transaction.discount),
      },
    });
  } catch (err) {
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
const create = async (data, username, nationality) => {
  try {
    const order = data.order;
    delete data.name;
    delete data.nationality;
    delete data.order;
    const user = await userModel.getUser(username);
    const transactionData = {
      user: {
        connect: { id: user.id },
      },
      nationality: nationality
        ? {
            connect: { id: nationality },
          }
        : {},
    };

    Object.assign(transactionData, data);
    const transaction = await prisma.transaction.create({
      data: transactionData,
    });
    createDetail(order, transaction);
  } catch (err) {
    throwError(err);
  }
};
const createDetail = async (order, transaction) => {
  try {
    for (const o of order) {
      await prisma.detailTrans.create({
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
