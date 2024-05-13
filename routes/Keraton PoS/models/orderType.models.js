const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderRelationModel = require("./orderRelation.models");

const isExist = async (id) => {
  try {
    return await prisma.orderType.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};

const getAll = async () => {
  try {
    return await prisma.orderType.findMany();
  } catch (err) {
    throwError(err);
  }
};

const create = async (data) => {
  try {
    return await prisma.orderType.create({ data: data });
  } catch (err) {
    throwError(err);
  }
};

const update = async (id, data) => {
  try {
    const orderType = await isExist(id);
    if (!orderType) throw Error("ID Order Type tidak ditemukan");
    return await prisma.orderType.update({ where: { id: id }, data: data });
  } catch (err) {
    throwError(err);
  }
};

const deleteOrderType = async (id) => {
  try {
    const type = await isExist(id);
    if (!type) throw Error("ID Order Type tidak ditemukan");
    const orders = await prisma.order.findMany({ where: { orderTypeId: id } });
    for (const order of orders) {
      await orderRelationModel.deleteOrder(order.id);
    }
    return await prisma.orderType.delete({ where: { id } });
  } catch (err) {
    throwError(err);
  }
};

module.exports = { isExist, getAll, create, update, deleteOrderType };
