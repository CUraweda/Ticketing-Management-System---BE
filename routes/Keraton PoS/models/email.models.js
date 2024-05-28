require("dotenv").config();
const { throwError } = require("../../utils/helper");
const { splitDate } = require("../../utils/helper");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
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
  if (!data.custEmail) {
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

    // Membuat PDF per item di ticketData.detailTrans
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

        const page = await browser.newPage();
        const htmlTicket = await ejs.renderFile(emailTicketPath, {
          title: `Tiket ${data.custName} ${createdDate}_${index + 1}`,
          logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
          ticketBg: `data:image/png;base64,${ticketBg}`,
          decorBg: `data:image/png;base64,${decorBg}`,
          tickets: [tickets],
          ticketQR,
        });
        await page.setContent(htmlTicket, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        const pdfBuffer = await page.pdf({
          width: `874px`,
          height: `324px`,
          printBackground: true,
          preferCSSPageSize: true,
          margin: {
            top: "2px",
            left: "2px",
            bottom: "0px",
            right: "0px",
          },
        });
        await page.close();
        return {
          buffer: pdfBuffer,
          ticketName: tickets.order.name || `Tiket_${index + 1}`,
        };
      })
    );

    // Render HTML untuk invoice dan ambil screenshot
    const htmlInvoice = await ejs.renderFile(emailInvoicePath, {
      title: `Invoice ${data.custName} ${createdDate}`,
      logoKKC: `data:image/svg+xml;base64,${logoKKC}`,
      cashier: data.user,
      customerName: data.custName,
      customerEmail: data.custEmail,
      customerNumber: data.custNumber,
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
      to: data.custEmail,
      subject: `Bukti Pembelian KKC ${data.custName} ${createdDate}`,
      html: `<p>Dear ${data.custName},</p><p>Thank you for your reservation.</p><img src="cid:invoiceImage" />`,
      attachments: attachments,
    };

    await transporter.sendMail(message);
    lastSentTime = currentTime;
    await browser.close();
    return "Email diterima!";
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  sendEmailToUser,
};
