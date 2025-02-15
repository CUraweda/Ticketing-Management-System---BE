require("dotenv").config();
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const html_to_pdf = require("html-pdf-node");
const puppeteer = require("puppeteer");
const fs = require("fs");
const globalParamModel = require('../../Website Keraton/models/params.models')
const path = require("path");
const transactionModelWeb = require('../../Website Keraton/models/transaction.models')
const barcodeModel = require('../../Website Keraton/models/barcode.model')
const {
  throwError,
  searchQr,
  createQr,
  splitDate,
  formatCurrency,
  generateTodayDate,
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

function transformUrl(url) {
  const relevantPart = url.replace(`${process.env.BASE_URL}`, "");
  const transformedUrl = `public${relevantPart}`;
  return transformedUrl;
}

const getInvoice = async (search, limit) => {
  try {
    const data = await prisma.transaction.findMany({
      where: {
        deleted: false,
        ...(search && {
          OR: [
            {
              id: search
            },
            {
              customer: {
                path: "name",
                string_contains: search
              },
            },
            {
              user: { name: { contains: search } },
            },
            {
              detailTrans: {
                some: {
                  OR: [
                    { order: { name: { contains: search } } },
                    { event: { name: { contains: search } } }
                  ]
                }
              }
            }
          ]
        }),
      },
      ...(limit != "0" && { take: +limit }),
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
        BarcodeUsage: true
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

const getAllDetail = async (args) => {
  try {
    return await prisma.detailTrans.findMany({ where: { ...args }, include: { nationality: true } })
  } catch (err) {
    throwError(err)
  }
}
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
      where: { id: id, deleted: false },
    });
  } catch (err) {
    throwError(err);
  }
};

const getTickets = async (id) => {
  try {
    let transaction = await prisma.transaction.findUnique({
      where: { id: id, deleted: false },
      include: {
        user: true,
        detailTrans: {
          include: {
            guide: true,
            order: { include: { category: true } },
            event: true
          },
        },
        BarcodeUsage: true
      },
    });
    const qrPath = transformUrl(transaction.BarcodeUsage[0].qrPath)
    const transactionImage = fs.readFileSync(qrPath, { encoding: "base64" });
    transaction.qrImage = `data:image/png;base64,${transactionImage}`
    const data = { ...transaction };
    return data;
  } catch (err) {
    throwError(err);
  }
};
const getRevenue = async () => {
  try {
    const { startDate, endDate } = generateTodayDate()
    const transaction = await prisma.transaction.findMany({
      where: { deleted: false, createdDate: { gte: startDate, lte: endDate } },
    });
    const total = parseInt(
      transaction.reduce((acc, curr) => acc + parseInt(curr.total), 0)
    );
    return total;
  } catch (err) {
    throwError(err);
  }
};

const getRevenueCurawedaKeraton = async (args) => {
  let todayRevenue = { revenueKeraton: { COH: 0, CIA: 0 }, revenueCuraweda: { COH: 0, CIA: 0 }, total: 0 }
  const { startDate, endDate } = generateTodayDate()
  try {
    const transaction = await prisma.transaction.findMany({
      where: {
        deleted: false, plannedDate: { gte: startDate, lte: endDate }, detailTrans: {
          some: {
            OR: [
              {
                event: { deleted: false }
              },
              {
                order: { deleted: false, disabled: false, category: { disabled: false } },
              }
            ]
          }
        }
      },
      select: { plannedDate: true, keratonIncome: true, curawedaIncome: true, total: true }
    })
    transaction.forEach(trans => {
      todayRevenue.revenueKeraton.COH += trans.keratonIncome.COH
      todayRevenue.revenueKeraton.CIA += trans.keratonIncome.CIA
      todayRevenue.revenueCuraweda.COH += trans.curawedaIncome.COH
      todayRevenue.revenueCuraweda.CIA += trans.curawedaIncome.CIA
      todayRevenue.total += +trans.total
    })
    return todayRevenue
  } catch (err) {
    throwError(err)
  }
}

const getRevenueCurawedaTabel = async (args) => {
  try {
    const { from, to } = args
    const { startDate, endDate } = generateTodayDate()
    try {
      return await prisma.transaction.findMany({
        where: {
          deleted: false,
          plannedDate: {
            gte: from ? `${from}T00:00:00.000Z` : startDate,
            lte: to ? `${to}T23:59:59.999Z` : endDate
          }
        },
        select: { plannedDate: true, keratonIncome: true, curawedaIncome: true, total: true }
      })
    } catch (err) {
      throwError(err)
    }
  } catch (err) {
    throwError(err)
  }
}
const getDistinctDate = async () => {
  try {
    return await prisma.transaction.findMany({ where: { deleted: false }, distinct: ["createdDate"] });
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
const create = async (data, user) => {
  let total = 0, revenueKeraton = { COH: 0, CIA: 0 }, revenueCuraweda = { COH: 0, CIA: 0 }, paramRevenueMethod, paramTax, possibleUses = 0
  const taxParam = await globalParamModel.getOne({ identifier: process.env.TAX_PARAMS_IDENTIFIER })
  try {
    let orders = data.order.map(cart => {
      const totalCart = cart.amount * cart.price
      total += totalCart
      possibleUses += cart.amount
      return {
        amount: cart.amount,
        orderId: cart.id,
        ...(cart.cityName && { cityName: cart.cityName }),
        ...(cart.nationalityId && { nationalityId: cart.nationalityId }),
        ...(cart.guideId != '' && { guideId: cart.guideId })
      }
    })
    delete data.order

    // DISCOUNT & CASHBACK
    if (data.cashback > 0) total -= total * (data.cashback / 100)
    if (data.discount > 0) total -= total * (data.discount / 100)

    // PAYMENT METHOD
    switch (data.method) {
      case "CASH":
        paramRevenueMethod = 'COH'
        paramTax = 'cash'
        break;
      default:
        paramRevenueMethod = 'CIA'
        paramTax = 'nonCash'
        break;
    }

    let totalTax = 0
    // TAXES
    taxParam.data[paramTax].forEach((param) => {
      const totalRawTax = param.multiply ? total * param.tax : param.tax
      totalTax += totalRawTax
      revenueKeraton[paramRevenueMethod] = total
      switch (param.paidBy) {
        case "user":
          total += totalRawTax
          revenueCuraweda[paramRevenueMethod] += totalRawTax
          break;
        case "keraton":
          revenueKeraton[paramRevenueMethod] = revenueKeraton[paramRevenueMethod] - totalRawTax
          revenueCuraweda[paramRevenueMethod] += totalRawTax
          break;
      }
    })


    data.total = total
    data.additionalFee = totalTax
    data.keratonIncome = revenueKeraton
    data.curawedaIncome = revenueCuraweda
    data.discount = `${data.discount} | ${data.discount}%`
    data.cashback = `${data.cashback} | ${data.cashback}%`
    data['userData'] = user

    const transaction = await prisma.transaction.create({ data, include: { detailTrans: true } });
    const plannedDate = new Date(transaction.plannedDate);
    const expiredAt = new Date(plannedDate);
    expiredAt.setDate(expiredAt.getDate() + 1);
    await barcodeModel.create({
      uniqueId: transaction.id,
      possibleUses, expiredAt
    })
    await logsModel.logCreate(
      `Membuat transaksi ${transaction.id} untuk pelanggan ${data.customer.name}`,
      "Transaction",
      "Success"
    );

    const orderDatas = orders.map((data) => {
      return {
        ...data,
        transactionId: transaction.id
      }
    })

    await transactionModelWeb.createManyDetail(orderDatas)
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
            top: '1cm',
            left: '1cm',
            right: '1cm',
            bottom: '1cm'
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
  try {
    const currentTime = Date.now();
    if (currentTime - lastSentTime < SEND_INTERVAL) throw Error("Tunggu beberapa detik sebelum mengirim lagi")
    if (!data.customer.email) throw Error("Email tidak ditemukan!")
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

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000,
    });

    // Path
    const decorBg = fs.readFileSync(`${assetsPath}/bg-decor.png`, { encoding: "base64", });
    const ticketBg = fs.readFileSync(`${assetsPath}/bg-keraton.png`, { encoding: "base64", });
    const logoKKC = fs.readFileSync(`${assetsPath}/logo.svg`, { encoding: "base64", });
    const logoBJB = fs.readFileSync(`${assetsPath}/bjb.png`, { encoding: "base64", });
    const logoCuraweda = fs.readFileSync(`${assetsPath}/curaweda.png`, { encoding: "base64", });
    const logoTelU = fs.readFileSync(`${assetsPath}/TelU.png`, { encoding: "base64", });
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
          ticket: tickets,
          ticketAmount: tickets.amount,
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
const deleteSoft = async (id) => {
  try {
    return await prisma.transaction.update({ where: { id }, data: { deleted: true } })
  } catch (err) {
    throwError(err)
  }
}
module.exports = {
  getInvoice,
  getAllDetail,
  getAll,
  deleteSoft,
  getOne,
  getTickets,
  getRevenueCurawedaTabel,
  getRevenueCurawedaKeraton,
  getRevenue,
  getYear,
  getMonth,
  create,
  printTransaction,
  sendEmailToUser,
};
