const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderModel = require("./order.models");
const logsModel = require("./logs.models");

const isExist = async (id) => {
  try {
    return await prisma.orderSubType.findFirst({
      where: { id: id, disabled: false },
    });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.orderSubType.findMany({
      where: { disabled: false },
      include: { orderType: true },
    });
  } catch (err) {
    throwError(err);
  }
};
const getRelated = async (id) => {
  try {
    return await prisma.orderSubType.findMany({
      where: { orderTypeId: id, disabled: false },
      include: { orderType: true },
    });
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    return await prisma.orderSubType
      .create({ data })
      .then(
        await logsModel.logCreate(
          `Membuat sub-tipe pesanan ${data.name}`,
          "Order Subtype",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logCreate(
      `Membuat sub-tipe pesanan ${data.name}`,
      "Order Subtype",
      "Failed"
    );
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const orderSubType = await isExist(id);
    if (!orderSubType) throw Error("ID Order Sub Type tidak ditemukan");
    return await prisma.orderSubType
      .update({ where: { id }, data })
      .then(
        await logsModel.logUpdate(
          `Mengubah sub-tipe pesanan ${orderSubType.name} menjadi ${data.name}`,
          "Order Subtype",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah sub-tipe pesanan ${id} menjadi ${data.name}`,
      "Order Subtype",
      "Failed"
    );
    throwError(err);
  }
};
const deleteOrderSubType = async (id) => {
  try {
    const orderSubType = await isExist(id);
    if (!orderSubType) throw Error("ID Order Sub Type tidak ditemukan");
    const orders = await prisma.order.findMany({
      where: { orderSubTypeId: id, disabled: false },
    });
    for (const order of orders) {
      if (!order.disabled) await orderModel.deleteOrder(order.id);
    }
    return await prisma.orderSubType
      .update({ where: { id }, data: { disabled: true } })
      .then(
        await logsModel.logDelete(
          `Menghapus sub-tipe pesanan ${orderSubType.name}`,
          "Order Subtype",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logDelete(
      `Menghapus sub-tipe pesanan ${id}`,
      "Order Subtype",
      "Failed"
    );
    throwError(err);
  }
};

module.exports = {
  isExist,
  getAll,
  getRelated,
  create,
  update,
  deleteOrderSubType,
};
