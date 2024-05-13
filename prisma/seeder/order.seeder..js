const { throwError } = require("../../routes/utils/helper");
const { prisma } = require("../../routes/utils/prisma");

const orders = [
  {
    name: "Tiket masuk Keraton Kasepuhan Cirebon",
    price: 10000.0,
    categoryId: 1,
  },
  {
    name: "Tiket masuk Keraton Kasepuhan Cirebon",
    price: 10000.0,
    categoryId: 2,
  },
  {
    name: "Tiket masuk Keraton Kasepuhan Cirebon",
    price: 10000.0,
    categoryId: 3,
  },
  {
    name: "Bundling tiket masuk Keraton Kasepuhan Cirebon",
    price: 30000.0,
    categoryId: 1,
  },
  {
    name: "Bundling tiket masuk Keraton Kasepuhan Cirebon",
    price: 30000.0,
    categoryId: 2,
  },
  {
    name: "Bundling tiket masuk Keraton Kasepuhan Cirebon",
    price: 30000.0,
    categoryId: 3,
  },
  {
    name: "Bertemu Pangeran",
    price: 25000.0,
    categoryId: 1,
  },
  {
    name: "Bertemu Pangeran",
    price: 25000.0,
    categoryId: 2,
  },
  {
    name: "Bertemu Pangeran",
    price: 25000.0,
    categoryId: 3,
  },
  {
    name: "Event bulanan",
    price: 15000.0,
    categoryId: 1,
  },
  {
    name: "Event bulanan",
    price: 15000.0,
    categoryId: 2,
  },
  {
    name: "Event bulanan",
    price: 15000.0,
    categoryId: 3,
  },
  {
    name: "Event mingguan",
    price: 15000.0,
    categoryId: 1,
  },
  {
    name: "Event mingguan",
    price: 15000.0,
    categoryId: 2,
  },
  {
    name: "Event mingguan",
    price: 15000.0,
    categoryId: 3,
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
