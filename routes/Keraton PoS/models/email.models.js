require("dotenv").config();
const { throwError } = require("../../utils/helper");
const { splitDate } = require("../../utils/helper");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const html_to_pdf = require("html-pdf-node");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

let lastSentTime = 0;
const SEND_INTERVAL = 15000;

const emailTicketPath = path.join(__dirname, "../views/email_ticket.ejs");
const emailInvoicePath = path.join(__dirname, "../views/email_invoice.ejs");
const assetsPath = path.join(__dirname, "../../../public/assets/email");
const qrPath = path.join(__dirname, "../../../public/qrcodes/");

const sendEmailToUser = async (data) => {
  const currentTime = Date.now();
  if (currentTime - lastSentTime < SEND_INTERVAL) {
    return res
      .status(429)
      .json({ msg: "Tunggu beberapa menit sebelum mengirim lagi" });
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

    // Render HTML untuk invoice dan ambil screenshot
    const htmlInvoice = await ejs.renderFile(emailInvoicePath, {
      title: `Invoice ${data.customer.name} ${createdDate}`,
      logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
      cashier: data.user,
      customer: data.customer,
      reserveDate,
      reserveTime,
      tickets: data.detailTrans,
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
    return "Email diterima!";
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  sendEmailToUser,
};
