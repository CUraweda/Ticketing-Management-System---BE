const { throwError } = require("../utils/helper")
const PaymentHelper = require("../utils/payment/payment")
const { prisma } = require("../utils/prisma");
const Emails = require("../Website Keraton/emails/email");
const paymentHelper = new PaymentHelper()

function transformUrl(url) {
    const relevantPart = url.replace(`${process.env.BASE_URL}`, "");
    const transformedUrl = `public${relevantPart}`;
    return transformedUrl;
}

const notify = async (id, args = {}) => {
    const { status } = args

    id = paymentHelper._decryptTID(id)
    const transactionData = await prisma.transaction.findFirst({
        where: {
            id
        },
        include: {
            user: true,
            detailTrans: { include: { order: true, event: true } },
            BarcodeUsage: true,
        }
    })
    if (!transactionData) throw Error("Couldn't find transaction data")

    let updateData = {}
    switch (status) {
        case 'SUCCESS':
            updateData['transaction'] = {
                paidTotal: (transactionData.total - transactionData.discountCutTotal + transactionData.additionalFee),
                status: 'DAPAT_DIGUNAKAN',
            };
            const emailData = {
                to: transactionData.user.email,
                subject: "Invoice Transaksi Pesananan - Keraton Kasepuhan Cirebon",
                data: {
                    email: transactionData.user.email,
                    name: transactionData.user.name,
                    date: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", }).format(new Date(transactionData.plannedDate)),
                    nomor_invoice: transactionData.id,
                    method: transactionData.method,
                    qr_exist: false,
                    invoices: transactionData.detailTrans.map((detail) => ({
                        item_desc: detail.order ? detail.order.name : detail.event.name,
                        quantity: detail.amount,
                        price: detail.orderId ? parseFloat(detail.order.price).toLocaleString("id-ID", { style: "currency", currency: "IDR", }) : parseFloat(detail.event.price).toLocaleString("id-ID", { style: "currency", currency: "IDR", }),
                        total: detail.amount * (detail.orderId ? detail.order.price : detail.event.price),
                    })),
                    subtotal: parseFloat(transactionData.total).toLocaleString("id-ID", { style: "currency", currency: "IDR", }),
                    tax: parseFloat(transactionData.additionalFee).toLocaleString("id-ID", { style: "currency", currency: "IDR", }),
                    total: (parseFloat(transactionData.total) + parseFloat(transactionData.additionalFee)).toLocaleString("id-ID", { style: "currency", currency: "IDR", }),
                },
                attachment: ["public/assets/email/logo.png"],
            };

            for (let barcode of transactionData.BarcodeUsage) {
                emailData.data.qr_exist = true;
                emailData.attachment.push(transformUrl(barcode.qrPath));
            }
            setImmediate(async () => {
                try {
                    const emailClass = new Emails(process.env.EMAIL_ACCOUNT, emailData.to, emailData.subject);
                    await emailClass.sendEmailTemplate("invoice", emailData.data, emailData.attachment).then(() => { console.log("Email berhasil terkirim"); });
                } catch (err) { console.log("Error while sending email", err); }
            });
            break;
        case 'FAILED':
            updateData['transaction'] = { isPaid: false, status: 'Gagal' };
            break;
        default:
            updateData['transaction'] = { isPaid: false, status: 'Gagal' };
            break;
    }

    const updatedData = await prisma.transaction.update({ where: { id }, data: updateData['transaction'] })
    if (!updatedData) throw new Error("Fail to update transaction data")

    return updatedData
}

const generateNew = async (id, args = {}) => {
    try{
        const { paymentType } = args
        const transactionData = await prisma.transaction.findFirst({
            where: { id },
            include: { user: true }
        })
        if (!transactionData) throw Error("Couldn't find transaction data")
        transactionData['paymentType'] = paymentType
    
        const createdPayment = await paymentHelper.create({
            paymentType,
            transactionId: transactionData.id,
            data: transactionData
        })
        if (!createdPayment) throw Error("Error on payment server")
        return await prisma.transaction.update({
            where: { id }, data: {
                method: paymentType,
                merchantTradeNo: createdPayment?.merchantTradeNo,
                platformTradeNo: createdPayment?.platformTradeNo,
                qrisLink: createdPayment?.qrisUrl,
                customerNo: createdPayment?.virtualAccountData?.customerNo,
                virtualAccountNo: createdPayment?.vaCode,
                expiredDate: createdPayment.expiredDate,
            }
        })
    }catch(e){
        console.log(e)
    }
}

module.exports = { notify, generateNew }