const {
  throwError,
  startDate,
  endDate,
  groupedPurchase,
  groupYearData,
  groupMonthData,
} = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");

const isExist = async (id) => {
  try {
    return await prisma.order.findFirst({
      where: { id: id, disabled: false },
      include: { category: true },
    });
  } catch (err) {
    throwError(err);
  }
};
const getOne = async (id) => {
  try {
    return await prisma.order.findFirst({
      where: { id: id, disabled: false },
      include: {
        category: true,
        orderSubType: { include: { orderType: true } },
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.order.findMany({
      where: { disabled: false },
      include: {
        category: true,
        orderSubType: { include: { orderType: true } },
      },
      orderBy: {
        createdDate: "desc",
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const getRecentData = async (start, end) => {
  try {
    return await prisma.order.findMany({
      where: { disabled: false },
      include: {
        category: true,
        detailTrans: {
          include: {
            transaction: true,
          },
          where: {
            transaction: {
              createdDate: {
                gte: start,
                lte: end,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    return await prisma.order
      .create({ data: data })
      .then(
        await logsModel.logCreate(
          `Membuat pesanan ${data.name}`,
          "Order",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logCreate(
      `Membuat pesanan ${data.name}`,
      "Order",
      "Failed"
    );
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const order = await isExist(id);
    if (!order) throw Error("Order ID tidak ditemukan");
    return await prisma.order
      .update({ where: { id: id }, data: data })
      .then(
        await logsModel.logUpdate(
          `Mengubah pesanan ${order.name} menjadi ${data.name}`,
          "Order",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah pesanan ${id} menjadi ${data.name}`,
      "Order",
      "Success"
    );
    throwError(err);
  }
};
const recentPurchase = async () => {
  try {
    const order = await getRecentData(startDate, endDate);
    const categories = await prisma.category.findMany({
      where: { disabled: false },
      select: { name: true },
    });
    return groupedPurchase(order, categories);
  } catch (err) {
    throwError(err);
  }
};
const getYearData = async (targetYear) => {
  try {
    const startTarget = new Date(`${targetYear}-01-01`);
    startTarget.setHours(7, 0, 0, 0);
    const endTarget = new Date(`${targetYear}-12-31`);
    endTarget.setHours(30, 59, 59, 999);
    const categories = await prisma.category.findMany({
      where: { disabled: false },
    });

    const data = await getRecentData(startTarget, endTarget);

    const names = categories.map((category) => category.name);
    const colors = categories.map((category) => category.color);

    return groupYearData(data, names, colors);
  } catch (err) {
    throwError(err);
  }
};
const getMonthData = async (targetYear, targetMonthInt) => {
  try {
    const daysInMonth = new Date(targetYear, targetMonthInt, 0).getDate();
    const startTarget = new Date(`${targetYear}-${targetMonthInt}-01`);
    startTarget.setHours(7, 0, 0, 0);
    const endTarget = new Date(
      `${targetYear}-${targetMonthInt}-${daysInMonth}`
    );
    endTarget.setHours(30, 59, 59, 999);
    const categories = await prisma.category.findMany({
      where: { disabled: false },
    });

    const data = await getRecentData(startTarget, endTarget);

    const names = categories.map((category) => category.name);
    const colors = categories.map((category) => category.color);

    return groupMonthData(data, names, colors, daysInMonth);
  } catch (err) {
    throwError(err);
  }
};
const deleteOrder = async (id) => {
  try {
    const order = await isExist(id);
    if (!order) throw Error("Order ID tidak ditemukan");
    await prisma.order
      .update({ where: { id }, data: { disabled: true } })
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

module.exports = {
  isExist,
  getOne,
  getAll,
  create,
  update,
  recentPurchase,
  getYearData,
  getMonthData,
  deleteOrder,
};
