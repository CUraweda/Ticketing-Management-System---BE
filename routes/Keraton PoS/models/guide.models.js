const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");

const getOne = async (id) => {
  try {
    return await prisma.guide.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.guide.findMany();
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    await logsModel.logCreate(`Membuat guide ${data.name}`, "Guide", "Success");
    return await prisma.guide.create({ data: data });
  } catch (err) {
    await logsModel.logCreate(`Membuat guide ${data.name}`, "Guide", "Failed");
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const guide = await getOne(id);
    if (!guide) throw Error("Guide ID tidak ditemukan");
    await logsModel.logUpdate(
      `Mengubah guide ${guide.name} menjadi ${data.name}`,
      "Guide",
      "Success"
    );
    return await prisma.guide.update({ where: { id: id }, data: data });
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah guide ${id} menjadi ${data.name}`,
      "Guide",
      "Failed"
    );
    throwError(err);
  }
};
const deleteGuide = async (id) => {
  try {
    const guide = await getOne(id);
    if (!guide) throw Error("Guide ID tidak ditemukan");
    await logsModel.logDelete(
      `Menghapus guide ${guide.name}`,
      "Guide",
      "Success"
    );
    return await prisma.guide.delete({ where: { id: id } });
  } catch (err) {
    await logsModel.logDelete(`Menghapus guide ${id}`, "Guide", "Failed");
    throwError(err);
  }
};

module.exports = { getOne, getAll, create, update, deleteGuide };
