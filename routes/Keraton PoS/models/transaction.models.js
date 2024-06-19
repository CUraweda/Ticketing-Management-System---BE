require("dotenv").config();
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const html_to_pdf = require("html-pdf-node");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const {
  throwError,
  startDate,
  endDate,
  searchQr,
  createQr,
  splitDate,
  formatCurrency,
} = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const logsModel = require("./logs.models");
const detailTransModel = require("./detailTrans.models");
const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

let lastSentTime = 0;
const SEND_INTERVAL = 15000;

const emailTicketPath = path.join(__dirname, "../views/email_ticket.ejs");
const emailInvoicePath = path.join(__dirname, "../views/email_invoice.ejs");
const assetsPath = path.join(__dirname, "../../../public/assets/email");
const qrPath = path.join(__dirname, "../../../public/qrcodes/");

const getInvoice = async (search) => {
  try {
    const data = await prisma.transaction.findMany({
      where: {
        ...(search && {
          // user: {
          //   name: { contains: search }
          // }
          detailTrans: {
            some: {
              OR: [
                { order: { name: { contains: search } } },
                { event: { name: { contains: search } } }
              ]
            }
          }
          // OR: [
          // {
          // },
          // {
          // }
          // ]
        }),
      },
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
            event: true
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
    return await prisma.transaction.findFirst({
      where: { id: id },
    });
  } catch (err) {
    throwError(err);
  }
};
const getAll = async (id) => {
  try {
    return await prisma.transaction.findMany({
      where: { id: id },
    });
  } catch (err) {
    throwError(err);
  }
};
const getTickets = async (id) => {
  try {
    const transaction = await prisma.transaction.findUnique({
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
    const qr = searchQr(transaction, "invoice");
    const data = {
      ...transaction,
      qr,
      detailTrans: transaction.detailTrans.map((detail) => {
        const qr = searchQr(detail, "ticket");
        return {
          ...detail,
          qr,
        };
      }),
    };
    return data;
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

    const transaction = await prisma.transaction.create({
      data: data,
    });
    createQr(transaction, "invoice");
    await logsModel.logCreate(
      `Membuat transaksi ${transaction.id} untuk pelanggan ${data.customer.name}`,
      "Transaction",
      "Success"
    );
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

    const decorBg = fs.readFileSync(`${assetsPath}/bg-decor.png`, { encoding: "base64" });
    const ticketBg = fs.readFileSync(`${assetsPath}/bg-keraton.png`, { encoding: "base64" });
    const logoKKC = fs.readFileSync(`${assetsPath}/logo.svg`, { encoding: "base64" });


    console.log(data.detailTrans)
    const pdfBuffers = await Promise.all(
      data.detailTrans.map(async (tickets, index) => {
        const qrArray = Object.values(tickets.qr);
        const ticketQR = await Promise.all(
          qrArray.map(async (qr) => {
            const formattedQrPath = qr.replace("./public/qrcodes/", "");
            const qrPathFull = path.join(qrPath, formattedQrPath);
            const qrBase64 = fs.readFileSync(qrPathFull, { encoding: "base64" });
            return `data:image/png;base64,${qrBase64}`;
          })
        );

        console.log(tickets)
        const htmlTicket = await ejs.renderFile(emailTicketPath, {
          title: `Tiket ${data.customer.name} ${createdDate}_${index + 1}`,
          logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
          ticketBg: `data:image/png;base64,${ticketBg}`,
          decorBg: `data:image/png;base64,${decorBg}`,
          ticket: tickets,
          ticketAmount: tickets.amount,
          ticketQR,
        });

        const options = {
          width: "2480",
          height: "3508",
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
      const filePath = path.join(pdfPath, `${ticketName} ${data.customer.name} ${formattedDate}.pdf`);
      fs.writeFileSync(filePath, buffer);

      const pdfUrl = `${BASE_URL}/pdfs/${ticketName} ${data.customer.name} ${formattedDate}.pdf`;

      import("open").then((openModule) => {
        openModule.default(pdfUrl)
          // .then(() => {
          // setTimeout(() => {

          // }, 2000);
          // })
          .catch((error) => {
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

const sendEmailToUser = async (data) => {
  const currentTime = Date.now();
  if (currentTime - lastSentTime < SEND_INTERVAL) {
    return res.status(429).json({ msg: "Tunggu beberapa detik sebelum mengirim lagi" });
  }
  if (!data.customer.email) {
    return throwError("Email tidak ditemukan!");
  }
  const config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };
  const transporter = nodemailer.createTransport(config);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000,
    });

    // Path
    const decorBg = fs.readFileSync(`${assetsPath}/bg-decor.png`, {
      encoding: "base64",
    });
    const ticketBg = fs.readFileSync(`${assetsPath}/bg-keraton.png`, {
      encoding: "base64",
    });
    const logoKKC = fs.readFileSync(`${assetsPath}/logo.svg`, {
      encoding: "base64",
    });

    const logoBJB = fs.readFileSync(`${assetsPath}/bjb.png`, {
      encoding: "base64",
    });

    const logoCuraweda = fs.readFileSync(`${assetsPath}/curaweda.png`, {
      encoding: "base64",
    });

    const logoTelU = fs.readFileSync(`${assetsPath}/TelU.png`, {
      encoding: "base64",
    });

    const [reserveDate, reserveTime] = splitDate(data.plannedDate);
    const [createdDate, createdTime] = splitDate(data.createdDate);

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
          logoBJB: `data:image/png;base64,${logoBJB}`,
          logoCuraweda: `data:image/png;base64,${logoCuraweda}`,
          logoTelU: `data:image/png;base64,${logoTelU}`,
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

    const InvoiceQRPath = data.qr[0].replace("./public/qrcodes/", "");
    const InvoiceQRPathFull = path.join(qrPath, InvoiceQRPath);
    const invoiceQR = fs.readFileSync(InvoiceQRPathFull, {
      encoding: "base64",
    });
    // Render HTML untuk invoice dan ambil screenshot
    data.additionalFee = formatCurrency(data.additionalFee);
    data.total = formatCurrency(data.total);
    const discountAmount = parseInt(
      data.discount.split("|")[1].trim().replace("%", "")
    );

    const invoiceTickets = data.detailTrans.map((item) => {
      const price = formatCurrency(item.order.price);
      const amount = formatCurrency(item.amount);
      const orderDiscount = formatCurrency(
        (item.order.price * item.amount * discountAmount) / 100
      );
      const discount = `Rp. ${orderDiscount},00 (${discountAmount}%)`;
      const totalPrice = formatCurrency(item.amount * item.order.price);

      return {
        ...item,
        price,
        amount,
        discountAmount,
        discount,
        totalPrice,
      };
    });
    const htmlInvoice = await ejs.renderFile(emailInvoicePath, {
      title: `Invoice ${data.customer.name} ${createdDate}`,
      logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
      logoTelU: `data:image/png;base64,${logoTelU}`,
      logoBJB: `data:image/png;base64,${logoBJB}`,
      logoCuraweda: `data:image/png;base64,${logoCuraweda}`,
      invoice: data,
      cashier: data.user,
      customer: data.customer,
      invoiceQR: `data:image/png;base64,${invoiceQR}`,
      reserveDate,
      reserveTime,
      tickets: invoiceTickets,
    });
    const page = await browser.newPage();
    await page.setContent(htmlInvoice, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    const invoiceImageBuffer = await page.screenshot({ type: "jpeg" });

    await browser.close();
    const attachments = pdfBuffers.map(({ buffer, ticketName }, index) => ({
      filename: `${ticketName}.pdf`,
      content: buffer,
      contentType: "application/pdf",
    }));
    attachments.push({
      filename: "invoice.jpg",
      content: invoiceImageBuffer,
      contentType: "image/jpeg",
      cid: "invoiceImage",
    });

    const message = {
      from: EMAIL,
      to: data.customer.email,
      subject: `Bukti Pembelian KKC ${data.customer.name} ${createdDate}`,
      html: `<p>Dear ${data.customer.name},</p><p>Thank you for your reservation.</p><img src="cid:invoiceImage" />`,
      attachments: attachments,
    };

    await transporter.sendMail(message);
    lastSentTime = currentTime;
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
  create,
  printTransaction,
  sendEmailToUser,
};
