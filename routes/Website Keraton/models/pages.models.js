const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

async function isExist(id) {
  const data = await prisma.pages.findFirst({ where: { id } });
  return data != null;
}

const getAll = async () => {
  try {
    const data = await prisma.pages.findMany();
    return data;
  } catch (err) {
    throwError(err);
  }
};

const getOne = async (id) => {
  try {
    await isExist(id).then((exist) => {
      if (!exist) throw Error("Content ID didnt Exist");
    });
    return await prisma.pages.findFirst({ where: { id } });
  } catch (err) {
    throwError(err);
  }
};

const getAllContent = async (id) => {
  try {
    await isExist(id).then((exist) => {
      if (!exist) throw Error("Content ID didnt Exist");
    });
    const subPages = await prisma.pages.findMany({
      where: { id },
     include: {
        contents: true
     }
    });
    return subPages;
  } catch (err) {
    throwError(err);
  }
};

const create = async (data) => {
  try {
    return await prisma.pages.create({ data });
  } catch (err) {
    throwError(err);
  }
};

const update = async (id, data) => {
  try {
    await isExist(id).then((exist) => {
      if (!exist) throw Error("Content ID didnt Exist");
    });
    return await prisma.pages.update({ id, data });
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  getAll,
  getOne,
  update,
  create,
  getAllContent,
};
