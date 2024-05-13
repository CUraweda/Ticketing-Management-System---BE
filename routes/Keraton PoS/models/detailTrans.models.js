const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

const getAll = async (search) => {
  try {
    return await prisma.detailTrans.findMany({
      where: search
        ? {
            OR: [
              {
                transaction: {
                  user: {
                    name: {
                      contains: search,
                    },
                  },
                },
              },
              {
                order: {
                  name: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {},
      include: {
        order: true,
        transaction: { include: { user: true } },
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const getFromOrderId = async (id) => {
  try {
    return await prisma.detailTrans.findFirst({ where: { orderID: id } });
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
const deleteDetailTrans = async (id) => {
  try {
    const data = await prisma.detailTrans.findMany({ where: { id: id } });
    await prisma.detailTrans.deleteMany({ where: { id: id } });
    return data
  } catch (err) {
    throwError(err);
  }
};

module.exports = { getAll, getFromOrderId, getTableData, deleteDetailTrans };
