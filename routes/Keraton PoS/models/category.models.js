const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderRelationModel = require("./orderRelation.models");
const logsModel = require("./logs.models");

const isExist = async (id) => {
  try {
    return await prisma.category.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.category.findMany();
  } catch (err) {
    throwError(err);
  }
};
const findPurchaseCategories = async () => {
  try {
    return await prisma.category.findMany({ select: { name: true } });
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    return await prisma.category
      .create({ data: data })
      .then(
        await logsModel.logCreate(
          `Membuat kategori ${data.name}`,
          "Category",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logCreate(
      `Membuat kategori ${data.name}`,
      "Category",
      "Failed"
    );
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const category = await isExist(id);
    if (!category) throw Error("ID Category tidak ditemukan");

    return await prisma.category
      .update({ where: { id: id }, data: data })
      .then(
        await logsModel.logUpdate(
          `Mengubah kategori ${category.name} menjadi ${data.name}`,
          "Category",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah kategori ${id} menjadi ${data.name}`,
      "Category",
      "Failed"
    );
    throwError(err);
  }
};
const deleteCategory = async (id) => {
  try {
    const category = await isExist(id);
    if (!category) throw Error("ID Category tidak ditemukan");
    const orders = await prisma.order.findMany({ where: { categoryId: id } });
    for (const order of orders) {
      await orderRelationModel.deleteOrder(order.id);
    }
    return await prisma.category
      .delete({ where: { id } })
      .then(
        await logsModel.logDelete(
          `Menghapus kategori ${category.name}`,
          "Category",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logDelete(`Menghapus kategori ${id}`, "Category", "Failed");
    throwError(err);
  }
};

module.exports = {
  isExist,
  getAll,
  findPurchaseCategories,
  create,
  update,
  deleteCategory,
};
