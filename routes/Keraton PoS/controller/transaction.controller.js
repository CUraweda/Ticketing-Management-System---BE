const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { formatCurrency } = require("../../utils/helper");
const fs = require("fs");
const path = require("path");
const keratonParamModel = require('../../Website Keraton/models/params.models')
const transactionModel = require("../models/transaction.models");
const { prisma } = require("../../utils/prisma");
const Emails = require("../../Website Keraton/emails/email");

expressRouter.get("/detail-invoice", async (req, res) => {
  try {
    const limit = req.query.limit || "10"
    const data = await transactionModel.getInvoice(req.query.search, limit);
    return success(res, "Data Invoice berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get('/get-all-detail', async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const firstDayISO = firstDay.toISOString().split('T')[0];
    const lastDayISO = lastDay.toISOString().split('T')[0];

    const data = await transactionModel.getAllDetail({
      transaction: { deleted: false, plannedDate: { gte: `${firstDayISO}T00:00:00.000Z`, lte: `${lastDayISO}T23:59:59.999Z` } },
      OR: [
        { nationalityId: { not: null } },
        { cityName: { not: null } }
      ]
    })
    return success(res, 'Berhasil di Fetch', data)
  } catch (err) {
    return error(res, err.message)
  }
})
expressRouter.get("/income-revenue", async (req, res) => {
  try {
    const data = await transactionModel.getRevenue();
    return success(res, "Data Income berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get('/income-revenue-curaweda', async (req, res) => {
  try {
    const data = await transactionModel.getRevenueCurawedaKeraton()
    return success(res, "Data income berhasil di fetch", data)
  } catch (err) {
    return error(res, err.message)
  }
})
expressRouter.get('/income-revenue-tabel', async (req, res) => {
  try {
    const data = await transactionModel.getRevenueCurawedaTabel(req.query)
    return success(res, 'Data income berhasil di fetch', data)
  } catch (err) {
    return error(res, err.message)
  }
})

expressRouter.get("/generate-tickets/:id", async (req, res) => {
  try {
    const data = await transactionModel.getTickets(req.params.id);
    return success(res, "Data Tiket berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/print-transaction", async (req, res) => {
  try {
    await transactionModel.printTransaction(req.body);
    return success(res, "Data Tiket berhasil diprint!");
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/email-transaction", async (req, res) => {
  try {
    await transactionModel.sendEmailToUser(req.body);
    return success(res, "Email berhasil dikirimkan!");
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.post("/create-transaction", async (req, res) => {
  try {
    const data = await transactionModel.create(req.body);
    return success(res, "Penambahan pesanan berhasil", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get('/delete-transaction/:id', async (req, res) => {
  try {
    const data = await transactionModel.deleteSoft(req.params.id)
    return success(res, 'Data Transaksi Dihapus', data)
  } catch (err) {
    return error(res, err.message)
  }
})
expressRouter.get('/list-tax', async (req, res) => {
  try {
    const data = await keratonParamModel.getOne({ identifier: process.env.TAX_PARAMS_IDENTIFIER })
    return success(res, 'Tax diperlihatkan', data)
  } catch (err) {
    return error(res, err.message)
  }
})
expressRouter.get("/target-revenue/:date", async (req, res) => {
  try {
    const data =
      req.params.date === "year"
        ? await transactionModel.getYear()
        : await transactionModel.getMonth();
    return success(res, "Data Invoice berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/email_invoice/:id", async (req, res) => {
  const data = await transactionModel.getTickets(req.params.id);
  const assetsPath = path.join(__dirname, "../../../public/assets/email");
  const qrPath = path.join(__dirname, "../../../public/qrcodes/");
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

  const InvoiceQRPath = data.qr[0].replace("./public/qrcodes/", "");
  const InvoiceQRPathFull = path.join(qrPath, InvoiceQRPath);
  const invoiceQR = fs.readFileSync(InvoiceQRPathFull, {
    encoding: "base64",
  });
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

  res.render("email_invoice", {
    title: "Invoice",
    logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
    logoTelU: `data:image/png;base64,${logoTelU}`,
    logoBJB: `data:image/png;base64,${logoBJB}`,
    logoCuraweda: `data:image/png;base64,${logoCuraweda}`,
    invoice: data,
    cashier: data.user,
    customer: data.customer,
    invoiceQR: `data:image/png;base64,${invoiceQR}`,
    reserveDate: "25/07/2024",
    reserveTime: "10:40",
    tickets: invoiceTickets,
  });
});

function transformUrl(url) {
  const relevantPart = url.replace(`${process.env.BASE_URL}`, "");
  const transformedUrl = `public${relevantPart}`;
  return transformedUrl;
}


expressRouter.get('/generate-email-invoice/:id', async (req, res) => {
  try {
    const transactionExist = await prisma.transaction.findFirstOrThrow({
      where: { id: req.params.id },
      include: {
        user: true,
        detailTrans: { include: { order: true, event: true } },
        BarcodeUsage: true,
      },
    });
    if (!transactionExist) throw Error("Transaction Didnt Exist");
    const emailData = {
      to: transactionExist.customer.email,
      subject: "Invoice Transaksi Pesananan - Keraton Kasepuhan Cirebon",
      data: {
        email: transactionExist.customer.email,
        name: transactionExist.customer.name,
        date: new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(transactionExist.plannedDate)),
        nomor_invoice: transactionExist.id,
        method: transactionExist.method,
        qr_exist: false,
        invoices: transactionExist.detailTrans.map((detail) => ({
          item_desc: detail.order ? detail.order.desc : detail.event.desc,
          quantity: detail.amount,
          price: detail.orderId ? parseFloat(detail.order.price).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          }) : parseFloat(detail.event.price).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          }),
          total: detail.amount * (detail.orderId ? detail.order.price : detail.event.price),
        })),
        subtotal: parseFloat(transactionExist.total).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
        tax: parseFloat(transactionExist.additionalFee).toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        ),
        total: (
          parseFloat(transactionExist.total) +
          parseFloat(transactionExist.additionalFee)
        ).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      },
      attachment: ["public/assets/email/logo.png"],
    };
    for (let barcode of transactionExist.BarcodeUsage) {
      emailData.data.qr_exist = true;
      emailData.attachment.push(transformUrl(barcode.qrPath));
    }
    setImmediate(async () => {
      try {
        const emailClass = new Emails(
          process.env.EMAIL_FROM,
          emailData.to,
          emailData.subject
        );
        await emailClass
          .sendEmailTemplate("invoice", emailData.data, emailData.attachment)
          .then(() => {
            console.log("Email berhasil terkirim");
            return success(res, 'Email Successfully sended')
          });
      } catch (err) {
        return error(res, 'Terjadi kesalahan saat mengirimkan email')
      }
    });
  } catch (err) {
    return error(res, err.message)
  }
})

module.exports = expressRouter;
