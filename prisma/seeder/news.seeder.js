const { throwError } = require("../../routes/utils/helper");
const { prisma } = require("../../routes/utils/prisma");

const news = [
  {
    title: "Ambatukam maling",
    desc: "Ditemukan jasad 1 orang",
    
  }
];

const categorySeed = async () => {
  try {
    for (let category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        create: category,
        update: category,
      });
    }
  } catch (err) {
    throwError(err);
  }
};

module.exports = { categorySeed };
