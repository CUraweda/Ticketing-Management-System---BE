const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderSubTypeModels = require("./orderSubType.models");
const logsModel = require("./logs.models");

const isExist = async (id) => {
  try {
    return await prisma.orderType.findFirst({
      where: { id: id, disabled: false },
    });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.orderType.findMany({ where: { disabled: false } });
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    return await prisma.orderType
      .create({ data: data })
      .then(
        await logsModel.logCreate(
          `Membuat tipe pesanan ${data.name}`,
          "Order Type",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logCreate(
      `Membuat tipe pesanan ${data.name}`,
      "Order Type",
      "Failed"
    );
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const orderType = await isExist(id);
    if (!orderType) throw Error("ID Order Type tidak ditemukan");
    return await prisma.orderType
      .update({ where: { id: id }, data: data })
      .then(
        await logsModel.logUpdate(
          `Mengubah tipe pesanan ${orderType.name} menjadi ${data.name}`,
          "Order Type",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah tipe pesanan ${id} menjadi ${data.name}`,
      "Order Type",
      "Failed"
    );
    throwError(err);
  }
};
const deleteOrderType = async (id) => {
  try {
    const orderType = await isExist(id);
    if (!orderType) throw Error("ID Order Type tidak ditemukan");
    const orderSubTypes = await prisma.orderSubType.findMany({
      where: { orderTypeId: id },
    });
    for (const subType of orderSubTypes) {
      if (!subType.disabled) await orderSubTypeModels.deleteOrderSubType(subType.id);
    }
    return await prisma.orderType
      .update({ where: { id }, data: { disabled: true } })
      .then(
        await logsModel.logDelete(
          `Menghapus tipe pesanan ${orderType.name}`,
          "Order Type",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logDelete(
      `Menghapus tipe pesanan ${id}`,
      "Order Type",
      "Failed"
    );
    throwError(err);
  }
};

module.exports = { isExist, getAll, create, update, deleteOrderType };
