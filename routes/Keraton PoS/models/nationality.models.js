const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

const getAll = async () => {
  try {
    return await prisma.nationality.findMany();
  } catch (err) {
    throwError(err);
  }
};

module.exports = { getAll };
