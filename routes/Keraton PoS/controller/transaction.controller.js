const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const { formatCurrency } = require("../../utils/helper");
const fs = require("fs");
const path = require("path");
const transactionModel = require("../models/transaction.models");

expressRouter.get("/detail-invoice", async (req, res) => {
  try {
    const data = await transactionModel.getInvoice(req.query.search);
    return success(res, "Data Invoice berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/income-revenue", async (req, res) => {
  try {
    const data = await transactionModel.getRevenue();
    return success(res, "Data Income berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
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

module.exports = expressRouter;
