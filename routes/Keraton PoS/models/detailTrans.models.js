const { throwError, createQr } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");

const getFromOrderId = async (id) => {
  try {
    return await prisma.detailTrans.findFirst({ where: { orderId: id } });
  } catch (err) {
    throwError(err);
  }
};
const getTableData = async (category) => {
  try {
    const detailTrans = await prisma.detailTrans.findMany({
      where: category
        ? {
            order: {
              category: {
                name: category,
              },
            },
          }
        : {},
      select: {
        amount: true,
        transaction: {
          select: { createdDate: true },
        },
        order: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true } },
            price: true,
          },
        },
      },
    });

    // Menghitung total harga pesanan dan menggabungkannya dengan hasil
    const finalDetailTrans = detailTrans.map((detailTrans) => ({
      ...detailTrans,
      total_price: detailTrans.amount * detailTrans.order.price,
    }));
    finalDetailTrans.sort((a, b) => {
      return (
        new Date(b.transaction.createdDate) -
        new Date(a.transaction.createdDate)
      );
    });
    return finalDetailTrans;
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
const create = async (order, transaction) => {
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
      createQr(data, "ticket");
      await logsModel.logCreate(
        `Membuat detail transaksi ${data.id}`,
        "DetailTrans",
        "Success"
      );
    }
  } catch (err) {
    await logsModel.logCreate(
      `Membuat detail transaksi dari ID transaksi ${transaction.id}`,
      "DetailTrans",
      "Failed"
    );
    throwError(err);
  }
};
const deleteDetailTrans = async (id) => {
  try {
    const data = await prisma.detailTrans.findMany({ where: { id: id } });
    await prisma.detailTrans.deleteMany({ where: { id: id } });
    return data;
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  getFromOrderId,
  getTableData,
  getUnavailableGuide,
  create,
  deleteDetailTrans,
};
