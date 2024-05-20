const {
  throwError,
  startDate,
  endDate,
  groupedPurchase,
  groupYearData,
  groupMonthData,
} = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const categoryModel = require("./category.models");
const logsModel = require("./logs.models");

const isExist = async (id) => {
  try {
    return await prisma.order.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getOne = async (id) => {
  try {
    return await prisma.order.findFirst({
      where: { id: id },
      include: { category: true, orderType: true, orderSubType: true },
    });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.order.findMany({
      include: { category: true, orderType: true, orderSubType: true },
    });
  } catch (err) {
    throwError(err);
  }
};
const getRecentData = async (start, end) => {
  try {
    return await prisma.order.findMany({
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
    await logsModel.logCreate(
      `Membuat pesanan ${data.name}`,
      "Order",
      "Success"
    );
    return await prisma.order.create({ data: data });
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
    await logsModel.logUpdate(
      `Mengubah pesanan ${order.name} menjadi ${data.name}`,
      "Order",
      "Success"
    );
    return await prisma.order.update({ where: { id: id }, data: data });
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
    const categories = await categoryModel.findPurchaseCategories();
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
    const categories = await categoryModel.getAll();

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
    const categories = await categoryModel.getAll();

    const data = await getRecentData(startTarget, endTarget);

    const names = categories.map((category) => category.name);
    const colors = categories.map((category) => category.color);

    return groupMonthData(data, names, colors, daysInMonth);
  } catch (err) {
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
};
