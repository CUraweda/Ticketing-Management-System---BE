const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");

const getOne = async (id) => {
  try {
    return await prisma.guide.findFirst({ where: { id: id, disabled: false } });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async () => {
  try {
    return await prisma.guide.findMany({
      where: { disabled: false },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    throwError(err);
  }
};
const emailExist = async (email) => {
  try{
    return await prisma.guide.findFirst({ where: { email } })
  }catch(err){
    throwError(err)
  }
}
const create = async (data) => {
  try {
    return await prisma.guide.create({ data: data }).then(
        await logsModel.logCreate(
          `Membuat guide ${data.name}`,
          "Guide",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logCreate(`Membuat guide ${data.name}`, "Guide", "Failed");
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    const guide = await getOne(id);
    if (!guide) throw Error("Guide ID tidak ditemukan");
    return await prisma.guide
      .update({ where: { id: id }, data: data })
      .then(
        await logsModel.logUpdate(
          `Mengubah guide ${guide.name} menjadi ${data.name}`,
          "Guide",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah guide ${id} menjadi ${data.name}`,
      "Guide",
      "Failed"
    );
    throwError(err);
  }
};

const createUpdate = async (ident, data = { id, email }) => {
  try{
    const guideExist = await emailExist(data.email)
    console.log(guideExist)
    if (guideExist && guideExist.disabled){ data.disabled = false
    }else throw Error('Email already used by another Guide')
    return await prisma.guide.upsert({
      where: { email: data.email },
      create: data, update: data
    })
  }catch(err){
    throwError(err)
  }
}
const deleteGuide = async (id) => {
  try {
    const guide = await getOne(id);
    if (!guide) throw Error("Guide ID tidak ditemukan");

    return await prisma.guide
      .update({
        where: { id },
        data: { disabled: true },
      })
      .then(
        await logsModel.logDelete(
          `Menghapus guide ${guide.name}`,
          "Guide",
          "Success"
        )
      );
  } catch (err) {
    await logsModel.logDelete(`Menghapus guide ${id}`, "Guide", "Failed");
    throwError(err);
  }
};

module.exports = { getOne, getAll, create, update, deleteGuide, createUpdate };
