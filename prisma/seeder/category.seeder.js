const { throwError } = require("../../routes/utils/helper");
const { prisma } = require("../../routes/utils/prisma");

const categories = [
  {
    name: "Umum",
    color: "#35E490",
  },
  {
    name: "Pelajar",
    color: "#5855EE",
  },
  {
    name: "Mancanegara",
    color: "#7C0428",
  },
  {
    name: "Terusan",
    color: "#7C0428",
  },
  {
    name: "Makanan",
    posOnly: true, 
    color: "#35E490",
  },
  {
    name: "Minuman",
    posOnly: true, 
    color: "#5855EE",
  },
  {
    name: "Suvenir",
    posOnly: true, 
    color: "#7C0428",
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
