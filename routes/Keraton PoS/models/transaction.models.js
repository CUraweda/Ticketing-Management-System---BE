const {
  throwError,
  startDate,
  endDate,
  searchQr,
  createQr,
} = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");
const detailTransModel = require("./detailTrans.models");

const getAll = async (search) => {
  try {
    const data = await prisma.transaction.findMany({
      where: search
        ? {
            OR: [
              {
                user: {
                  name: {
                    contains: search,
                  },
                },
              },
              {
                detailTrans: {
                  some: {
                    order: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              },
            ],
          }
        : {},
      include: {
        user: true,
        detailTrans: {
          include: {
            guide: true,
            order: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdDate: "desc",
      },
    });

    const finalData = data.map((transaction) => {
      const qr = searchQr(transaction, "invoice");
      return {
        ...transaction,
        qr,
      };
    });

    return finalData;
  } catch (err) {
    throwError(err);
  }
};
const getOne = async (id) => {
  try {
    return await prisma.transaction.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getTickets = async (id) => {
  try {
    const data = await prisma.transaction.findUnique({
      where: { id: id },
      include: {
        user: true,
        detailTrans: {
          include: {
            guide: true,
            order: { include: { category: true } },
          },
        },
      },
    });
    const finalData = {
      ...data,
      detailTrans: data.detailTrans.map((detail) => {
        const qr = searchQr(detail, "ticket");
        return {
          ...detail,
          qr,
        };
      }),
    };
    return finalData;
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
    createQr(transaction, "invoice");
    await detailTransModel.create(order, transaction);
    return transaction.id;
  } catch (err) {
    await logsModel.logCreate(`Membuat transaksi`, "Transaction", "Failed");
    throwError(err);
  }
};

module.exports = {
  getAll,
  getOne,
  getTickets,
  getRevenue,
  getYear,
  getMonth,
  updateTransData,
  create,
};
