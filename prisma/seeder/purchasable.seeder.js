const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")

const purchasables = [
    {
        name: "Tiket Masuk Keraton",
        desc: "Menikmati area Keraton. Jam operasional dari 08.00 - 17.00 WIB.",
        price: 10000,
        priceUmum: 15000,
        priceMancanegara: 20000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 2
    },
    {
        name: "Tiket Masuk Museum",
        desc: "Menikmati area Museum. Jam operasional dari 08.00 - 17.00 WIB.",
        price: 15000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 1
    },
    {
        name: "Tiket Masuk Keraton + Museum",
        desc: "Menikmati area Keraton dan Museum. Jam operasional dari 08.00 - 17.00 WIB.",
        price: 20000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 1
    },
    {
        name: "Paket Wisata Silaturahmi I",
        desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan",
        price: 85000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 3
    },
    {
        name: "Paket Wisata Silaturahmi II",
        desc: "Menikmati Keraton dengan guide + snack khas cirebon + silatuhrahmi dan foto bersama dengan Sultan + kesenian",
        price: 135000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 3
    },
    {
        name: "Paket Wisata Silaturahmi III",
        desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + silatuhrahmi dan foto bersama dengan Sultan + kesenian",
        price: 200000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 3
    },
    {
        name: "Paket Wisata Non Silaturahmi I",
        desc: "Menikmati Keraton dengan guide + snack khas cirebon + kesenian",
        price: 115000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 4
    },
    {
        name: "Paket Wisata Non Silaturahmi II",
        desc: "Menikmati Keraton dengan guide + makan (masakan nasional) + kesenian",
        price: 175000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 4
    },
    {
        name: "Paket Wisata Non Silaturahmi III",
        desc: "Menikmati Keraton dengan guide + makan (masakan khas Cirebon) + kesenian",
        price: 175000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 4
    },
    {
        name: "Paket Wisata Pelajar",
        desc: "Menikmati Keraton dengan guide + makan (nasi dus) + belajar sejarah dan kesenian",
        price: 60000,
        unit: "orang",
        image: "https://picsum.photos/200/300",
        subTypeId: 5
    },
]

const purchasableSeed = async () => {
    try {
        await prisma.purchasable.createMany({ data: purchasables })
    } catch (err) {
        throwError(err)
    }
}

module.exports =  { purchasableSeed }