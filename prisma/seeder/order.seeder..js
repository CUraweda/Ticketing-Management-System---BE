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
  {
    name: "Tiket Masuk Keraton Mancanegara",
    desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    price: 20000.0,
    categoryId: 3,
    orderSubTypeId: 1,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton"
  },
  {
    name: "Tiket Masuk Museum",
    desc: "Menikmati area Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    price: 15000,
    categoryId: 3,
    orderSubTypeId: 1,
    wisataRelation: "museum",
    wisataDesc: "Area Museum Pusaka"
  },
  {
    name: "Tiket Masuk Keraton + Museum",
    desc: "Menikmati area Keraton dan Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    price: 20000,
    categoryId: 3,
    orderSubTypeId: 1,
    wisataRelation: "keraton museum",
    wisataDesc: "Area Keraton - Area Museum Pusaka"
  },

  {
    name: "Paket Wisata Silaturahmi I",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan.",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    price: 85000,
    categoryId: 3,
    orderSubTypeId: 2,
    units: "paket",
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Snack - Foto bersama Sultan"
  },
  {
    name: "Paket Wisata Silaturahmi II",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhra_hmi dan foto bersama dengan Sultan + kesenian.",
    price: 135000,
    categoryId: 3,
    units: "paket",
    orderSubTypeId: 2,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Snack - Foto bersama Sultan - Kesenian"
  },
  {
    name: "Paket Wisata Silaturahmi III",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + silatuhrahmi dan foto bersama dengan Sultan + kesenian",
    price: 200000,
    categoryId: 3,
    units: "paket",
    orderSubTypeId: 2,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Makan - Foto bersama Sultan - Kesenian"
  },
  {
    name: "Paket Wisata Non Silaturahmi I",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + kesenian.",
    price: 115000,
    categoryId: 3,
    units: "paket",
    orderSubTypeId: 3,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Snack - Kesenian"
  },
  {
    name: "Paket Wisata Non Silaturahmi II",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + kesenian.",
    price: 175000,
    categoryId: 3,
    units: "paket",
    orderSubTypeId: 3,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Makan - Kesenian"
  },
  {
    name: "Paket Wisata Non Silaturahmi III",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati Keraton dengan guide + makan (masakan khas Cirebon) + kesenian.",
    price: 175000,
    categoryId: 3,
    units: "paket",
    orderSubTypeId: 3,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Makan - Kesenian"
  },
  {
    name: "Paket Wisata Pelajar",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Menikmati Keraton dengan guide + makan (nasi dus) + belajar sejarah dan kesenian.",
    price: 60000,
    categoryId: 3,
    units: "paket",
    orderSubTypeId: 4,
    wisataRelation: "keraton",
    wisataDesc: "Area Keraton - Guide - Makan - Sejarah & Kesenian"
  },
  
  {
    name: "Makanan 1",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Makanan khas Keraton Kasepuhann Cirebon",
    price: 15000,
    categoryId: 5,
    units: "item",
    orderSubTypeId: 5,
  },
  {
    name: "Makanan 2",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Makanan khas Cirebon",
    price: 35000,
    categoryId: 5,
    units: "item",
    orderSubTypeId: 5,
  },
  {
    name: "Minuman 1",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Minuman khas Keraton Kasepuhan Cirebon",
    price: 10000,
    categoryId: 6,
    units: "unit",
    orderSubTypeId: 5,
  },
  {
    name: "Minuman 2",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Minuman khas Cirebon",
    price: 20000,
    categoryId: 6,
    units: "unit",
    orderSubTypeId: 5,
  },
  {
    name: "Souvenir 1",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Souvenir khas Keraton Kasepuhan Cirebon",
    price: 50000,
    categoryId: 7,
    units: "unit",
    orderSubTypeId: 5,
  },
  {
    name: "Souvenir 2",
    image: `${process.env.BASE_URL}/assets/dashboard/default_placeholder.jpg`,
    desc: "Souvenir khas Cirebon",
    price: 70000,
    categoryId: 7,
    units: "unit",
    orderSubTypeId: 5,
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
