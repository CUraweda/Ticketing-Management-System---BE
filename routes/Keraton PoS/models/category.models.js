const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderModel = require("./order.models");
const logsModel = require("./logs.models");

const isExist = async (id) => {
  try {
    return await prisma.category.findFirst({
      where: { id: id, disabled: false },
    });
  } catch (err) {
    throwError(err);
  }
};

const existInDB = async (id) => {
  try{
    return await prisma.category.findFirst({ where: { id } })
  }catch(err){
    throwError(err)
  }
}
 
const getAll = async () => {
  try {
    return await prisma.category.findMany({ where: { disabled: false } });
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
    const category = await existInDB(id);
    if (!category) throw Error("ID Category tidak ditemukan");

    return await prisma.category.update({ where: { id: id }, data: data }).then(
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
      if (!order.disabled) await orderModel.deleteOrder(order.id);
    }
    return await prisma.category
      .update({ where: { id }, data: { disabled: true } })
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
const findUniqueName = async (uniqueData) => {
  const { name } = uniqueData
  try {
    return await prisma.category.findFirst({ where: { name } })
  } catch (err) {
    throwError(err)
  }
}

module.exports = {
  isExist,
  getAll,
  create,
  update,
  findUniqueName,
  deleteCategory,
};
