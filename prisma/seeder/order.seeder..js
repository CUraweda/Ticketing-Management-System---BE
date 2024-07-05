const { throwError } = require("../../routes/utils/helper");
const { prisma } = require("../../routes/utils/prisma");

const orders = [
  {
    name: "Tiket Masuk Keraton Umum",
    price: 10000.0,
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
    categoryId: 1,
    orderSubTypeId: 1,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton"

  },
  {
    name: "Tiket Masuk Keraton Pelajar",
    desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    price: 15000.0,
    categoryId: 2,
    orderSubTypeId: 1,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton"
  },
];

const orderSeed = async () => {
  try {
    await prisma.order.createMany({ data: orders });
  } catch (err) {
    throwError(err);
  }
};

module.exports = { orderSeed };
