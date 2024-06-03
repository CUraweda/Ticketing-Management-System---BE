const { throwError } = require("../../routes/utils/helper");
const { prisma } = require("../../routes/utils/prisma");

const news = [
  {
    title: "Keraton Kasepuhan Cirebon Ulang Tahun",
    desc: "Sebuah pencapaian besar dari Keraton Kasepuhan Cirebon",
    link: "https://picsum.photos/200/300",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Keraton Kasepuhan Cirebon mencapai 1000 tiket dalam 1 hari",
    desc: "Pada tanggal 29 November sebuah pencapaian baru bari keraton kasepuhan cirebon",
    link: "https://picsum.photos/200/300",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Keraton Kasepuhan Cirebon menjadi spot wisata nomor 1",
    desc: "Pencapaian yang didapatkan menjadikan Keraton Kasepuhan Cirebon, salah satu spot wisata terbaik di Cirebon",
    link: "https://picsum.photos/200/300",
    image: "https://picsum.photos/200/300"
  },
];

const newsSeed = async () => {
  try {
    return await prisma.news.createMany({ data: news })
  } catch (err) {
    throwError(err);
  }
};

module.exports = { newsSeed };
