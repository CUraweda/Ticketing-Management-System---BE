const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

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
    return await prisma.guide.create({ data: data });
  } catch (err) {
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const exist = await getOne(id);
    if (!exist) throw Error("Guide ID tidak ditemukan");
    return await prisma.guide.update({ where: { id: id }, data: data });
  } catch (err) {
    throwError(err);
  }
};

module.exports = { getOne, getAll, create, update };
