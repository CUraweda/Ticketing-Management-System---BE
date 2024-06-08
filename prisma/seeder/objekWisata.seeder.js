const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")

const objekWisata = [
    {
        label: "Baluarti Keraton",
        to: "/wisata/keraton",
        orderIdentifier: "keraton"
    },
    {
        label: "Museum Pusaka",
        to: "/wisata/museum",
        orderIdentifier: "museum"
    },
    {
        label: "Dalem Agung Pangkuwati",
        to: "/wisata/museum",
        orderIdentifier: "dalemAgung"
    },
]

const objekWisataSeed = async () => {
    try{
        return await prisma.objekWisata.createMany({ data: objekWisata })
    }catch(err){
        throwError(err)
    }
}

module.exports = { objekWisataSeed }