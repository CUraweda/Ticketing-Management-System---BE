const { name } = require("ejs");
const { throwError, createQr } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");

const getFromOrderId = async (id) => {
  try {
    return await prisma.detailTrans.findMany({
      where: { orderId: id },
    });
  } catch (err) {
    throwError(err);
  }
};
const getTableData = async (query) => {
  const { category, date } = query
  try {
    const detailTrans = await prisma.detailTrans.findMany({
      where: {
        transaction: {
          ...(date && {
            plannedDate: {
              gte: `${date}T00:00:00.000Z`,
              lte: `${date}T23:59:59.999Z`,
            }
          })
        },
        order: {
          deleted: false,
          disabled: false,
          ...(category && {
            category: {
              name: category
            }
          })
        }
      },
      include: {
        transaction: {
          include: { user: true }
        },
        order: { include: { category: true } },
      },
      orderBy: { transaction: { createdDate: 'desc' } }
    });

    // Menghitung total harga pesanan dan menggabungkannya dengan hasil
    return detailTrans;
  } catch (err) {
    throwError;
  }
};
const getUnavailableGuide = async (date) => {
  try {
    date = date.split(" ")[0];
    const startTarget = new Date(date);
    const endTarget = new Date(startTarget.getTime() + 8 * 60 * 60 * 1000);
    return await prisma.detailTrans.findMany({
      where: {
        transaction: {
          plannedDate: {
            gte: startTarget,
            lte: endTarget,
          },
        },
      },
      select: {
        guide: { select: { id: true } },
      },
    });
  } catch (err) {
    throwError;
  }
};
const getOneDaySellCategory = async (gte, lte) => {
  try {
    return await prisma.detailTrans.findMany({
      where: {
        transaction: {
          plannedDate: { gte, lte }
        },
        order: {
          deleted: false,
          disabled: false
        }
      },
      select: { amount: true, order: { select: { category: { select: { name: true } } } } }
    })
  } catch (err) {
    throwError(err)
  }
}

const create = async (order, transaction, customer) => {
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
          }
        },
      });
      createQr(data, "ticket");
      // await logsModel.logCreate(
      //   `Membuat detail transaksi ${data.id} untuk pelanggan ${customer.name}`,
      //   "Detail Transaction",
      //   "Success"
      // );
    }
  } catch (err) {
    await logsModel.logCreate(
      `Membuat detail transaksi dari ID transaksi ${transaction.id} untuk pelanggan ${customer.name}`,
      "Detail Transaction",
      "Failed"
    );
    throwError(err);
  }
};


module.exports = {
  getFromOrderId,
  getOneDaySellCategory,
  getTableData,
  getUnavailableGuide,
  create,
};
