require("dotenv").config();
const ejs = require("ejs");
const html_to_pdf = require("html-pdf-node");
const fs = require("fs");
const path = require("path");
const {
  throwError,
  startDate,
  endDate,
  searchQr,
  createQr,
  splitDate,
} = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");
const detailTransModel = require("./detailTrans.models");
const BASE_URL = 'https://api-prmn.curaweda.com:3031';

const getInvoice = async (search) => {
  try {
    const data = await prisma.transaction.findMany({
      where: search
        ? {
          OR: [
            {
              user: {
                name: {
                  contains: search,
                },
              },
            },
            {
              detailTrans: {
                some: {
                  order: {
                    name: {
                      contains: search,
                    },
                  },
                },
              },
            },
          ],
        }
        : {},
      include: {
        user: true,
        detailTrans: {
          include: {
            guide: true,
            order: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdDate: "desc",
      },
    });

    const finalData = data.map((transaction) => {
      const qr = searchQr(transaction, "invoice");
      return {
        ...transaction,
        qr,
      };
    });

    return finalData;
  } catch (err) {
    throwError(err);
  }
};
const getOne = async (id) => {
  try {
    return await prisma.transaction.findFirst({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async (id) => {
  try {
    return await prisma.transaction.findMany({ where: { id: id } });
  } catch (err) {
    throwError(err);
  }
};
const getTickets = async (id) => {
  try {
    const data = await prisma.transaction.findUnique({
      where: { id: id },
      include: {
        user: true,
        detailTrans: {
          include: {
            guide: true,
            order: { include: { category: true } },
          },
        },
      },
    });
    const finalData = {
      ...data,
      detailTrans: data.detailTrans.map((detail) => {
        const qr = searchQr(detail, "ticket");
        return {
          ...detail,
          qr,
        };
      }),
    };
    return finalData;
  } catch (err) {
    throwError(err);
  }
};
const getRevenue = async () => {
  try {
    const transaction = await prisma.transaction.findMany({
      where: { createdDate: { gte: startDate, lte: endDate } },
    });
    const total = parseInt(
      transaction.reduce((acc, curr) => acc + parseInt(curr.total), 0)
    );
    return total;
  } catch (err) {
    throwError(err);
  }
};
const updateTransData = async (
  transaction = [],
  order = [],
  detailTrans = []
) => {
  try {
    const formattedDiscount = parseInt(
      transaction.discount.split("|")[1].trim().replace("%", "")
    );
    let orderPrice = order.price * detailTrans.amount;
    const transTotal = parseFloat(
      transaction.total -=
      (orderPrice -
        (orderPrice * formattedDiscount / 100))
    )
    console.log(transTotal)
    console.log((orderPrice * formattedDiscount / 100))
    const data = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        total: transTotal
      },
    });
    await logsModel.logUpdate(
      `Mengubah total transaksi ${transaction.id}`,
      "Transaction",
      "Success"
    );
    return data;
  } catch (err) {
    await logsModel.logUpdate(
      `Mengubah total transaksi ${transaction.id}`,
      "Transaction",
      "Failed"
    );
    throwError(err);
  }
};
const getDistinctDate = async () => {
  try {
    return await prisma.transaction.findMany({ distinct: ["createdDate"] });
  } catch (err) {
    throwError(err);
  }
};
const getYear = async () => {
  try {
    const distinct = await getDistinctDate();
    const years = distinct.map((transaction) => {
      return new Date(transaction.createdDate).getFullYear();
    });
    const data = [...new Set(years)];
    return data;
  } catch (err) {
    throwError(err);
  }
};
const getMonth = async () => {
  try {
    const distinct = await getDistinctDate();
    const months = distinct.map((transaction) => {
      return new Date(transaction.createdDate).getMonth() + 1;
    });
    const data = [...new Set(months)];
    return data;
  } catch (err) {
    throwError(err);
  }
};
const create = async (data) => {
  try {
    const order = data.order;
    delete data.order;
    console.log(data)
    const transaction = await prisma.transaction.create({ data })

    console.log('RIGHT HERE 2')
    // await logsModel.logCreate(
    //   `Membuat transaksi ${transaction.id} untuk pelanggan ${data.customer.name}`,
    //   "Transaction",
    //   "Success"
    // );
    console.log('RIGHT HERE 3')
    createQr(transaction, "invoice");
    console.log('RIGHT HERE 4')
    await detailTransModel.create(order, transaction, data.customer);
    return transaction.id;
  } catch (err) {
    console.log(err)
    await logsModel.logCreate(
      `Membuat transaksi untuk pelanggan ${data.customer.name}`,
      "Transaction",
      "Failed"
    );
    throwError(err);
  }
};


const printTransaction = async (data) => {
  try {
    const emailTicketPath = path.join(__dirname, "../views/email_ticket.ejs");
    const assetsPath = path.join(__dirname, "../../../public/assets/email");
    const qrPath = path.join(__dirname, "../../../public/qrcodes/");
    const pdfPath = path.join(__dirname, "../../../public/pdfs/");
    const pdfDir = "./public/pdfs";
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir);
    }

    const [createdDate, createdTime] = splitDate(data.createdDate);

    const decorBg = fs.readFileSync(`${assetsPath}/bg-decor.png`, {
      encoding: "base64",
    });
    const ticketBg = fs.readFileSync(`${assetsPath}/bg-keraton.png`, {
      encoding: "base64",
    });
    const logoKKC = fs.readFileSync(`${assetsPath}/logo.svg`, {
      encoding: "base64",
    });

    const pdfBuffers = await Promise.all(
      data.detailTrans.map(async (tickets, index) => {
        const qrArray = Object.values(tickets.qr);

        const ticketQR = await Promise.all(
          qrArray.map(async (qr) => {
            const formattedQrPath = qr.replace("./public/qrcodes/", "");
            const qrPathFull = path.join(qrPath, formattedQrPath);
            const qrBase64 = fs.readFileSync(qrPathFull, {
              encoding: "base64",
            });
            return `data:image/png;base64,${qrBase64}`;
          })
        );

        const htmlTicket = await ejs.renderFile(emailTicketPath, {
          title: `Tiket ${data.customer.name} ${createdDate}_${index + 1}`,
          logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
          ticketBg: `data:image/png;base64,${ticketBg}`,
          decorBg: `data:image/png;base64,${decorBg}`,
          tickets: [tickets],
          ticketQR,
        });

        const options = {
          width: "870px",
          height: "320px",
          margin: {
            top: "1px",
            left: "1px",
          },
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          printBackground: true,
        };

        // Mengelompokkan generatePdf() ke dalam promise baru
        const pdfBuffer = await new Promise((resolve, reject) => {
          html_to_pdf
            .generatePdf({ content: htmlTicket }, options)
            .then((result) => resolve(result))
            .catch((err) => reject(err));
        });

        return {
          buffer: pdfBuffer,
          ticketName: tickets.order.name || `Tiket_${index + 1}`,
        };
      })
    );

    pdfBuffers.forEach(({ buffer, ticketName }, index) => {
      const formattedDate = createdDate.replace(/[/\\?%*:|"<>]/g, "-");
      const filePath = path.join(
        pdfPath,
        `${ticketName} ${data.customer.name} ${formattedDate}.pdf`
      );
      fs.writeFileSync(filePath, buffer);

      const pdfUrl = `${BASE_URL}/pdfs/${ticketName} ${data.customer.name} ${formattedDate}.pdf`;
      import("open")
        .then((openModule) => {
          openModule.default(pdfUrl).catch((error) => {
            console.error(`Failed to open ${pdfUrl} in browser:`, error);
          });
        })
        .catch((error) => {
          console.error(`Failed to import open module:`, error);
        });
    });
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  getInvoice,
  getAll,
  getOne,
  getTickets,
  getRevenue,
  getYear,
  getMonth,
  updateTransData,
  create,
  printTransaction,
};
