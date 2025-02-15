var express = require("express");
var router = express.Router();
const path = require("path");
const Email = require("../emails/email");
const { error, success } = require("../../utils/response");
const { prisma } = require("../../utils/prisma");
const { auth } = require("../middlewares/auth");
const orderModel = require("../models/order.models");
const eventModel = require("../models/events.models");

function transformUrl(url) {
  const relevantPart = url.replace(`${process.env.BASE_URL}`, "");
  const transformedUrl = `public${relevantPart}`;
  return transformedUrl;
}

router.get('/render-sub', async (req, res) => {
  try {
    res.render(path.resolve("routes/Website Keraton/emails/templates/subscription"), {
      title: "TITLE HERE",
      desc: "Description Here",
      link: process.env.BASE_URL
    })
  } catch (err) {
    return error(res, err.message)
  }
})

router.get('/render-ticket', async (req, res) => {
  try {
    res.render(path.resolve('routes/Keraton PoS/views/email_ticket'), {
      title: "Title Here",
      ticketBg: "/public/assets/email/bg-keraton.png",
      logoKKC: "/public/assets/email/logo.png",
      decorBg: "/public/assets/email/bg-decor.png",
      ticketQR: ["/public/assets/email/testqr.jpg"],
      tickets: [{
        amount: 1,
        order: { name: "Ticket Name Here" }
      }]
    })
  } catch (err) {
    return error(res, err.message)
  }
})

router.get('/render-invoice', async (req, res) => {
  try {
    res.render(path.resolve('routes/Keraton PoS/views/email_invoice'), {
      title: "Title Here",
      ticketBg: "/public/assets/email/bg-keraton.png",
      logoKKC: "/public/assets/email/logo.png",
      logoBJB: "/public/assets/email/bjb.png",
      logo: "/public/assets/email/curaweda.png",
      logoTelU: "/public/assets/email/TelU.png",
      decorBg: "/public/assets/email/bg-decor.png",
      reserveDate: '2024-01-04',
      reserveTime: "09:00",
      invoiceQR: "/public/assets/email/bg-decor.png",
      cashier: {
        name: "Cashier Name",
        email: "Cashier Email@gmail.com"
      },
      customer: {
        name: "Customer Name",
        number: "00982398398283"
      },
      invoice: {
        customer: {
          name: "Customer Name"
        },
        additionalFee: 9000,
        method: "BJB",
        total: 900000
      },
      tickets: [{
        order: {
          name: "Order Name"
        },
        guide: {
          name: "Guide Name"
        },
        totalPrice: "908423908490",
        discountAmount: 10,
        discount: "10",
        amount: "908",
        price: "Price Here"
      }]
    })
  } catch (err) {
    return error(res, err.message)
  }
})

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

router.get("/render/subscription", async (req, res) => {
  try {
    res.render(
      path.resolve("routes/Website Keraton/emails/templates/subscription"),
      {
        title: "Title Here",
        desc: "Description Here",
        link: "http://localhost:9000/",
      }
    );
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/invoice/:id", auth([]), async (req, res) => {
  try {
    const transactionExist = await prisma.transaction.findFirstOrThrow({
      where: { id: req.params.id, deleted: false },
      include: {
        user: true,
        detailTrans: { include: { order: true, event: true } },
        BarcodeUsage: true,
      },
    });
    if (!transactionExist) throw Error("Transaction Didnt Exist");
    if (!req.user.email) throw Error("User has no email");
    const emailData = {
      to: req.user.email,
      subject: "Invoice Transaksi Pesananan - Keraton Kasepuhan Cirebon",
      data: {
        email: transactionExist.user.email,
        name: transactionExist.user.name,
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
        const emailClass = new Email(
          process.env.EMAIL_ACCOUNT,
          emailData.to,
          emailData.subject
        );
        await emailClass
          .sendEmailTemplate("invoice", emailData.data, emailData.attachment)
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

router.post(
  "/subscription/promote",
  auth(["SUPER_ADMIN", "ADMIN"]),
  async (req, res) => {
    const { identifier, id, sendTo, promoteLink } = req.body;
    try {
      const dataReference =
        identifier != "event"
          ? await orderModel.getOne(id)
          : await eventModel.getOne(+id);
      if (!dataReference) throw Error("Sorry ID didnt Exist");
      let emailData = {
        to: sendTo.join(","),
        subject: "Penawaran - Keraton Kasepuhan Cirebon",
        data: {
          title: dataReference.name,
          desc: dataReference.desc,
          link: promoteLink,
        },
        attachment: [
          "public/assets/email/logo.png",
          // "public/assets/email/bjb.png",
          // "public/assets/email/TelU.png"
          dataReference.image.includes(process.env.BASE_URL) ? transformUrl(dataReference.image) : "public/assets/email/bg-keraton.png",
        ],
      };
      setImmediate(async () => {
        console.log('Generating Email...')
        const emailClass = new Email(
          process.env.EMAIL_ACCOUNT,
          emailData.to,
          emailData.subject
        );
        await emailClass
          .sendEmailTemplate(
            "subscription",
            emailData.data,
            emailData.attachment
          )
          .then(() => {
            console.log("Email berhasil terkirim");
          });
      });
      return success(res, "Email Request is sended, please wait...");
    } catch (err) {
      return error(res, err.message);
    }
  }
);

module.exports = router;
