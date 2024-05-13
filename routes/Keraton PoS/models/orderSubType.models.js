const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderRelationModel = require("./orderRelation.models");

const isExist = async (id) => {
  try {
    return await prisma.orderSubType.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.orderSubType.findMany({ include: { orderType: true } });
  } catch (err) {
    throwError(err);
  }
};
const getRelated = async (id) => {
  try {
    return await prisma.orderSubType.findMany({
      where: { orderTypeId: id },
      include: { orderType: true },
    });
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    return await prisma.orderSubType.create({ data });
  } catch (err) {
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const orderSubType = await isExist(id);
    if (!orderSubType) throw Error("ID Order Sub Type tidak ditemukan");
    return await prisma.orderSubType.update({ where: { id }, data });
  } catch (err) {
    throwError(err);
  }
};
const deleteOrderSubType = async (id) => {
  try {
    const subtype = await isExist(id);
    if (!subtype) throw Error("ID Order Sub Type tidak ditemukan");
    const orders = await prisma.order.findMany({
      where: { orderSubTypeId: id },
    });
    for (const order of orders) {
      await orderRelationModel.deleteOrder(order.id);
    }
    return await prisma.orderSubType.delete({ where: { id } });
  } catch (err) {
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
