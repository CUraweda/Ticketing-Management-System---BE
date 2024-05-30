var express = require("express");
var router = express.Router();
const path = require("path");
const Email = require("../emails/email");
const { error } = require("../../utils/response");
const { userInfo } = require("os");
const emailClass = new Email();

router.get("/render", async (req, res) => {
  try {
    res.render(
      path.resolve("routes/Website Keraton/emails/templates/invoice"),
      {
        email: "steve@gmail.com",
        name: "Steve",
        date: new Date().toLocaleDateString(),
        nomor_invoice: 109109019020,
        method: "method",
        invoices: [
          {
            item_desc: "test",
            quantity: "test",
            price: "test",
            total: "test",
          },
          {
            item_desc: "test",
            quantity: "test",
            price: "test",
            total: "test",
          },
        ],
        subtotal: 2000,
        tax: 1000,
        total: 3000,
      }
    );
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/invoice/:id", async (req, res) => {
  try {
    const transactionExist = await prisma.transaction.findFirstOrThrow({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!transactionExist) throw Error("Transaction Didnt Exist");
    const emailClass = new Email(
      process.env.EMAIL_FROM,
      "nadifdzaikra@gmail.com",
      "Test"
    );
    emailClass.sendEmailTemplate({
      email: transactionExist,
      name: "Steve",
      date: new Date().toLocaleDateString(),
      nomor_invoice: 109109019020,
      method: method,
      invoices: [
        {
          item_desc: "test",
          quantity: "test",
          price: "test",
          total: "test",
        },
        {
          item_desc: "test",
          quantity: "test",
          price: "test",
          total: "test",
        },
      ],
      subtotal: 2000,
      tax: 1000,
      total: 3000,
    });
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
