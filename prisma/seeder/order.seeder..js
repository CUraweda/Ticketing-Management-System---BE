const { throwError } = require("../../routes/utils/helper");
const { prisma } = require("../../routes/utils/prisma");

const orders = [
  {
    name: "Tiket Masuk Keraton Umum",
    price: 10000.0,
    image: "https://picsum.photos/200/300",
    desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
    categoryId: 1,
    orderSubTypeId: 1
  },
  {
    name: "Tiket Masuk Museum",
    desc: "Menikmati area Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 15000,
    categoryId: 1,
    orderSubTypeId: 1
  },
  {
    name: "Tiket Masuk Keraton + Museum",
    desc: "Menikmati area Keraton dan Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 20000,
    categoryId: 1,
    orderSubTypeId: 1
  },
  
  {
    name: "Paket Wisata Silaturahmi I",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan.",
    image: "https://picsum.photos/200/300",
    price: 85000,
    categoryId: 1,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Silaturahmi II",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan + kesenian.",
    price: 135000,
    categoryId: 1,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Silaturahmi III",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + silatuhrahmi dan foto bersama dengan Sultan + kesenian",
    price: 200000,
    categoryId: 1,
    orderSubTypeId: 3
  },
  {
    name: "Paket Wisata Non Silaturahmi I",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + kesenian.",
    price: 115000,
    categoryId: 1,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Non Silaturahmi II",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + kesenian.",
    price: 175000,
    categoryId: 1,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Non Silaturahmi III",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan khas Cirebon) + kesenian.",
    price: 175000,
    categoryId: 1,
    orderSubTypeId: 3
  },
  {
    name: "Paket Wisata Pelajar",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (nasi dus) + belajar sejarah dan kesenian.",
    price: 60000,
    categoryId: 1,
    orderSubTypeId: 4
  },
  {
    name: "Tiket Masuk Keraton Pelajar",
    desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 15000.0,
    categoryId: 2,
    orderSubTypeId: 1
  },
  {
    name: "Tiket Masuk Keraton Mancanegara",
    desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 20000.0,
    categoryId: 3,
    orderSubTypeId: 1
  },
  {
    name: "Tiket Masuk Museum",
    desc: "Menikmati area Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 15000,
    categoryId: 2,
    orderSubTypeId: 1
  },
  {
    name: "Tiket Masuk Keraton + Museum",
    desc: "Menikmati area Keraton dan Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 20000,
    categoryId: 2,
    orderSubTypeId: 1
  },
  
  {
    name: "Paket Wisata Silaturahmi I",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan.",
    image: "https://picsum.photos/200/300",
    price: 85000,
    categoryId: 2,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Silaturahmi II",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan + kesenian.",
    price: 135000,
    categoryId: 2,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Silaturahmi III",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + silatuhrahmi dan foto bersama dengan Sultan + kesenian",
    price: 200000,
    categoryId: 2,
    orderSubTypeId: 3
  },
  {
    name: "Paket Wisata Non Silaturahmi I",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + kesenian.",
    price: 115000,
    categoryId: 2,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Non Silaturahmi II",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + kesenian.",
    price: 175000,
    categoryId: 2,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Non Silaturahmi III",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan khas Cirebon) + kesenian.",
    price: 175000,
    categoryId: 2,
    orderSubTypeId: 3
  },
  {
    name: "Paket Wisata Pelajar",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (nasi dus) + belajar sejarah dan kesenian.",
    price: 60000,
    categoryId: 2,
    orderSubTypeId: 4
  },
  {
    name: "Tiket Masuk Museum",
    desc: "Menikmati area Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 15000,
    categoryId: 3,
    orderSubTypeId: 1
  },
  {
    name: "Tiket Masuk Keraton + Museum",
    desc: "Menikmati area Keraton dan Museum. Jam operasional dari 08.00 - 17.00 WIB.",
    image: "https://picsum.photos/200/300",
    price: 20000,
    categoryId: 3,
    orderSubTypeId: 1
  },
  
  {
    name: "Paket Wisata Silaturahmi I",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan.",
    image: "https://picsum.photos/200/300",
    price: 85000,
    categoryId: 3,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Silaturahmi II",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan + kesenian.",
    price: 135000,
    categoryId: 3,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Silaturahmi III",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + silatuhrahmi dan foto bersama dengan Sultan + kesenian",
    price: 200000,
    categoryId: 3,
    orderSubTypeId: 3
  },
  {
    name: "Paket Wisata Non Silaturahmi I",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + snack khas cirebon + kesenian.",
    price: 115000,
    categoryId: 3,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Non Silaturahmi II",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + kesenian.",
    price: 175000,
    categoryId: 3,
    orderSubTypeId: 2
  },
  {
    name: "Paket Wisata Non Silaturahmi III",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (masakan khas Cirebon) + kesenian.",
    price: 175000,
    categoryId: 3,
    orderSubTypeId: 3
  },
  {
    name: "Paket Wisata Pelajar",
    image: "https://picsum.photos/200/300",
    desc: "Menikmati Keraton dengan guide + makan (nasi dus) + belajar sejarah dan kesenian.",
    price: 60000,
    categoryId: 3,
    orderSubTypeId: 4
  }
];

const orderSeed = async () => {
  try {
    await prisma.order.createMany({ data: orders });
  } catch (err) {
    throwError(err);
  }
};

module.exports = { orderSeed };
