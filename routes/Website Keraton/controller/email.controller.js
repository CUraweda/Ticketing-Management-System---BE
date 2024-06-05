var express = require("express");
var router = express.Router();
const path = require("path");
const Email = require("../emails/email");
const { error, success } = require("../../utils/response");
const { userInfo } = require("os");
const { splitDate } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const { auth } = require("../middlewares/auth");
const emailClass = new Email();

function transformUrl(url) {
  const relevantPart = url.replace(process.env.BASE_URL, "");
  const transformedUrl = `public${relevantPart}`;
  return transformedUrl;
}

router.get("/render", async (req, res) => {
  try {
    res.render(
      path.resolve("routes/Website Keraton/emails/templates/invoice"),
      {
        email: "steve@gmail.com",
        name: "Steve",
        date: new Date().toLocaleDateString(),
        imageAttachment: "/public/assets/email/testqr.jpg",
        nomor_invoice: 1091090190909090909090909020,
        method: "method",
        invoices: [
          {
            item_desc: "test",
            quantity: "20",
            price: parseFloat(3000).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
            total: parseFloat(3000).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
          },
          {
            item_desc: "test",
            quantity: "20",
            price: parseFloat(3000).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
            total: parseFloat(3000).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
          },
        ],
        subtotal: parseFloat(2000).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
        tax: parseFloat(1000).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
        total: parseFloat(3000).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      }
    );
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/invoice/:id", auth([]), async (req, res) => {
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
      to: "rikanaap@gmail.com",
      subject: "Invoice Transaksi Pesananan - Keraton Kasepuhan Cirebon",
      data: {
        email: transactionExist.user.email,
        name: transactionExist.user.name,
        date: transactionExist.plannedDate.toLocaleDateString(),
        nomor_invoice: transactionExist.id,
        method: transactionExist.method,
        qr_exist: false,
        invoices: transactionExist.detailTrans.map((detail) => ({
          item_desc: detail.order.desc,
          quantity: detail.amount,
          price: detail.orderId
            ? parseFloat(detail.order.price).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })
            : parseFloat(detail.event.price).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              }),
          total:
            detail.amount *
            (detail.orderId ? detail.order.price : detail.event.price),
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
        const emailClass = new Email(
          process.env.EMAIL_FROM,
          emailData.to,
          emailData.subject
        );
        await emailClass
          .sendEmailTemplate(emailData.data, emailData.attachment)
          .then(() => {
            console.log("Email berhasil terkirim");
          });
      } catch (err) {
        console.log("Error while sending email", err);
      }
    });
    return success(res, "Request sended, please wait", 201);
  } catch (err) {
    console.log(err);
    return error(res, err.message);
  }
});

module.exports = router;
